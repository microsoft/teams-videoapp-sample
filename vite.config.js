import mkcert from 'vite-plugin-mkcert'
export default {
    base: '/teams-videoapp-sample/',
    build: {
        outDir: './dist/app'
    },
    plugins: [
        mkcert()
    ],
    server: {
        https: true
    }
}
