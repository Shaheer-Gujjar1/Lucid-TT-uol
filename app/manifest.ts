import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Lucid Aura∞',
        short_name: 'Lucid Aura',
        description: 'Premier Academic Utility for UOL students.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#4f46e5',
        icons: [
            {
                src: '/logo-primary.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo-primary.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
