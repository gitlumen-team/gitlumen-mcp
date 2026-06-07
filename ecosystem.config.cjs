module.exports = {
  apps: [
    {
      name: 'gitlumen-mcp-http',
      script: 'src/http.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        HOST: process.env.HOST || '127.0.0.1',
        PORT: process.env.PORT || 3333,
        MCP_AUTH_TOKEN: process.env.MCP_AUTH_TOKEN || '',
        GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
        GITLUMEN_MCP_DATA_DIR: process.env.GITLUMEN_MCP_DATA_DIR || '.gitlumen-mcp',
        GITLUMEN_MAX_FILE_BYTES: process.env.GITLUMEN_MAX_FILE_BYTES || '120000'
      }
    }
  ]
};
