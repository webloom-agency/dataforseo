#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DataForSEOClient, DataForSEOConfig } from '../core/client/dataforseo.client.js';
import { SerpApiModule } from '../core/modules/serp/serp-api.module.js';
import { KeywordsDataApiModule } from '../core/modules/keywords-data/keywords-data-api.module.js';
import { OnPageApiModule } from '../core/modules/onpage/onpage-api.module.js';
import { DataForSEOLabsApi } from '../core/modules/dataforseo-labs/dataforseo-labs-api.module.js';
import { EnabledModulesSchema, isModuleEnabled, defaultEnabledModules } from '../core/config/modules.config.js';
import { BaseModule, ToolDefinition } from '../core/modules/base.module.js';
import { z } from 'zod';
import { BacklinksApiModule } from "../core/modules/backlinks/backlinks-api.module.js";
import { BusinessDataApiModule } from "../core/modules/business-data-api/business-data-api.module.js";
import { DomainAnalyticsApiModule } from "../core/modules/domain-analytics/domain-analytics-api.module.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request as ExpressRequest, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { GetPromptResult, isInitializeRequest, ReadResourceResult, ServerNotificationSchema } from "@modelcontextprotocol/sdk/types.js"
import { name, version } from '../core/utils/version.js';
import { ModuleLoaderService } from "../core/utils/module-loader.js";
import { initializeFieldConfiguration } from '../core/config/field-configuration.js';
import { initMcpServer } from "./init-mcp-server.js";

// Initialize field configuration if provided
initializeFieldConfiguration();

// Extended request interface to include auth properties
interface Request extends ExpressRequest {
  username?: string;
  password?: string;
}

console.error('Starting DataForSEO MCP Server...');
console.error(`Server name: ${name}, version: ${version}`);

function getSessionId() {
  return randomUUID().toString();
}

async function main() {
  const app = express();
  app.use(express.json());

  // Bearer auth middleware (access control for the MCP endpoint)
  const bearerAuth = (req: Request, res: Response, next: NextFunction) => {
    const expectedToken = process.env.MCP_BEARER_TOKEN;

    // If no token configured, skip (no extra protection)
    if (!expectedToken) {
      return next();
    }

    const authHeader = req.headers.authorization;

    // Allow requests with no Authorization header (will be handled by basicAuth or env vars)
    if (!authHeader) {
      return next();
    }

    // Allow Basic Auth to pass through (it's for DataForSEO, not MCP server auth)
    if (authHeader.startsWith('Basic ')) {
      console.error('Basic Auth detected, passing through to DataForSEO client');
      return next();
    }

    // Only validate Bearer tokens if present
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      if (token !== expectedToken) {
        return res.status(403).json({
          jsonrpc: '2.0',
          error: {
            code: -32003,
            message: 'Forbidden: Invalid Bearer token',
          },
          id: null,
        });
      }

      // Valid Bearer token, continue
      return next();
    }

    // Unknown auth type
    return res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32002,
        message: 'Unauthorized: Invalid Authorization header format',
      },
      id: null,
    });
  };

  // Basic Auth Middleware
  const basicAuth = (req: Request, res: Response, next: NextFunction) => {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    console.error(authHeader)
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      next();
      return;
    }

    // Extract credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      console.error('Invalid credentials');
      res.status(401).json({
        jsonrpc: "2.0",
        error: {
          code: -32001, 
          message: "Invalid credentials"
        },
        id: null
      });
      return;
    }

    // Add credentials to request
    req.username = username;
    req.password = password;
    next();
  };

  const handleMcpRequest = async (req: Request, res: Response) => {
    // In stateless mode, create a new instance of transport and server for each request
    // to ensure complete isolation. A single instance would cause request ID collisions
    // when multiple clients connect concurrently.
    
    try {
      
      // Check if we have valid credentials from Basic Auth
      console.error('Request credentials:', {
        hasUsername: !!req.username,
        hasPassword: !!req.password,
        username: req.username ? `${req.username.substring(0, 3)}***` : 'none'
      });

      // If no credentials from Basic Auth, use environment variables
      if (!req.username || !req.password) {
        const envUsername = process.env.DATAFORSEO_USERNAME;
        const envPassword = process.env.DATAFORSEO_PASSWORD;
        
        console.error('Using environment credentials:', {
          hasEnvUsername: !!envUsername,
          hasEnvPassword: !!envPassword,
          envUsername: envUsername ? `${envUsername.substring(0, 3)}***` : 'none'
        });

        if (!envUsername || !envPassword) {
          console.error('ERROR: No DataForSEO credentials provided - neither in request nor in environment variables');
          res.status(401).json({
            jsonrpc: "2.0",
            error: {
              code: -32001,
              message: "Authentication required. DataForSEO credentials missing."
            },
            id: null
          });
          return;
        }
        
        // Use environment variables
        req.username = envUsername;
        req.password = envPassword;
      }
      
      console.error('Final credentials to be used:', {
        hasUsername: !!req.username,
        hasPassword: !!req.password
      });
      
      const server = initMcpServer(req.username, req.password); 
      console.error(Date.now().toLocaleString())

      const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined
      });

      await server.connect(transport);
      console.error('handle request');
      await transport.handleRequest(req , res, req.body);
      console.error('end handle request');
      req.on('close', () => {
        console.error('Request closed');
        transport.close();
        server.close();
      });

    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  };

  const handleNotAllowed = (method: string) => async (req: Request, res: Response) => {
    console.error(`Received ${method} request`);
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed."
      },
      id: null
    });
  };

  // Apply bearer auth and basic auth, then shared handler to both endpoints
  app.post('/http', bearerAuth, basicAuth, handleMcpRequest);
  app.post('/mcp', bearerAuth, basicAuth, handleMcpRequest);

  app.get('/http', handleNotAllowed('GET HTTP'));
  app.get('/mcp', handleNotAllowed('GET MCP'));

  app.delete('/http', handleNotAllowed('DELETE HTTP'));
  app.delete('/mcp', handleNotAllowed('DELETE MCP'));

  // Start the server
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, () => {
    console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
  });
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
