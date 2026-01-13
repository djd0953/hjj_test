/** @type {import('next').NextConfig} */
module.exports = {
  async rewrites() {
    return [
      {
        // Proxy /b/... and /p/... to backend at localhost:9090
        source: '/:mode(b|p)/:keyword*',
        destination: 'http://localhost:9090/:mode/:keyword*'
      }
    ]
  }
}
