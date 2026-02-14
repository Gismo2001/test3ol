

export default {
  optimizeDeps: {
    include: ['ol'],
  },
  
  build: {
    sourcemap: true,
  },
  server: {
    
    proxy: {
      '/lgln-stac': {
        target: 'https://dgm.stac.lgln.niedersachsen.de',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/lgln-stac/, ''),
      },
    },
  },
}

