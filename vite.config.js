import mkcert from 'vite-plugin-mkcert'
export default {
    base: '/teams-videoapp-sample/app/t2/',
    build: {
        outDir: './dist/app/t2'
    },
    plugins: [
        mkcert()
    ],
    server: {
        https: true
    }
}
