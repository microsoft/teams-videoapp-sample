// // vite.config.js
// import { defineConfig } from 'vite'
// import dns from 'dns'



// dns.setDefaultResultOrder('verbatim')

// export default defineConfig({
//   // omit

//   plugins: [
//     basicSsl()
//   ] ,

//   server: {
//     open: '/index.html'
//   }
// })


import mkcert from 'vite-plugin-mkcert'
export default {
    plugins: [
        mkcert()

    ],
    server: {
        https: true
    }
}