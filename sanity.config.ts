import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemaTypes'

export default defineConfig({
    name: 'default',
    title: 'Sandro Frinolli Portfolio',
    projectId: 'vci8k9tk',
    dataset: 'production',
    plugins: [structureTool()],
    schema: {
        types: schemaTypes,
    },
})