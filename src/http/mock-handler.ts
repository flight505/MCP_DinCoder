import { Request, Response } from 'express';

/**
 * Mock handler for testing - directly handles JSON-RPC requests
 * This bypasses the StreamableHTTPServerTransport for now
 */
export async function handleMockRequest(req: Request, res: Response): Promise<void> {
  const body = req.body;
  
  // Validate JSON-RPC request
  if (!body?.jsonrpc || body.jsonrpc !== '2.0') {
    res.status(200).json({
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Invalid Request: Missing or invalid jsonrpc field'
      },
      id: body?.id || null
    });
    return;
  }
  
  // Handle different methods
  switch (body.method) {
    case 'initialize':
      res.setHeader('Mcp-Session-Id', 'test-session-123');
      res.status(200).json({
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2025-03-26',
          capabilities: {
            tools: {
              listChanged: true
            }
          },
          serverInfo: {
            name: 'mcp-dincoder',
            version: '0.0.1'
          }
        },
        id: body.id
      });
      break;
      
    case 'tools/list':
      res.status(200).json({
        jsonrpc: '2.0',
        result: {
          tools: [
            {
              name: 'test.echo',
              description: 'Echo test tool',
              inputSchema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          ]
        },
        id: body.id
      });
      break;
      
    case 'tools/call': {
      const toolName = body.params?.name;
      if (toolName === 'test.echo') {
        res.status(200).json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: `Echo: ${body.params?.arguments?.message || ''}`
              }
            ]
          },
          id: body.id
        });
      } else {
        res.status(200).json({
          jsonrpc: '2.0',
          error: {
            code: -32602,
            message: 'Invalid params: Unknown tool'
          },
          id: body.id
        });
      }
      break;
    }
      
    default:
      // Unknown method
      res.status(200).json({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found'
        },
        id: body.id
      });
      break;
  }
}