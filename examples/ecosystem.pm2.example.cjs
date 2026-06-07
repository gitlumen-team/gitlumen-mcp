module.exports = {
  apps: [
    {
      name: 'gitlumen-mcp-http',
      script: 'src/http.js',
      cwd: '/opt/gitlumen-mcp-server',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3333,
        HOST: '127.0.0.1',
        MCP_AUTH_TOKEN: 'replace_with_a_long_random_token',
        GITHUB_TOKEN: '',
        GITLUMEN_MCP_DATA_DIR: '.gitlumen-mcp',
        GITLUMEN_MAX_FILE_BYTES: '120000'
      }
    }
  ]
};
