import mkcert from 'vite-plugin-mkcert'
export default {
    plugins: [
        mkcert()
    ],
    server: {
        https: true
    }
}