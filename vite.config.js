import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// base './' makes the build work at any URL, including
// https://<user>.github.io/Claim-Defender/
export default defineConfig({ base: './', plugins: [react(), viteSingleFile()] })
