// vite.config.ts
import react from "file:///E:/KW/Git/G-Asset%20Forge/node_modules/.pnpm/@vitejs+plugin-react@4.7.0__b0d86bfde40888beec37f6934c54823e/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
import { defineConfig } from "file:///E:/KW/Git/G-Asset%20Forge/node_modules/.pnpm/vite@5.4.19_@types+node@22._436355620e1b4ce000f29da54d9878ea/node_modules/vite/dist/node/index.js";
import checker from "file:///E:/KW/Git/G-Asset%20Forge/node_modules/.pnpm/vite-plugin-checker@0.6.4_e_fc05740432e2b8f4d1c1f7ed164de986/node_modules/vite-plugin-checker/dist/esm/main.js";
var __vite_injected_original_dirname = "E:\\KW\\Git\\G-Asset Forge\\apps\\g-asset-forge";
var vite_config_default = defineConfig({
  plugins: [react(), checker({ typescript: true })],
  base: "./",
  server: {
    port: 6167,
    host: true
  },
  build: {
    outDir: "build",
    cssCodeSplit: false
  },
  resolve: {
    alias: {
      "@g-asset-forge/core": resolve(__vite_injected_original_dirname, "../../packages/core/src"),
      "@g-asset-forge/common": resolve(__vite_injected_original_dirname, "../../packages/common/src"),
      "@g-asset-forge/geo": resolve(__vite_injected_original_dirname, "../../packages/geo/src"),
      "@g-asset-forge/icons": resolve(__vite_injected_original_dirname, "../../packages/icons/src"),
      "@g-asset-forge/components": resolve(__vite_injected_original_dirname, "../../packages/components/src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxLV1xcXFxHaXRcXFxcRy1Bc3NldCBGb3JnZVxcXFxhcHBzXFxcXGctYXNzZXQtZm9yZ2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEtXXFxcXEdpdFxcXFxHLUFzc2V0IEZvcmdlXFxcXGFwcHNcXFxcZy1hc3NldC1mb3JnZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovS1cvR2l0L0ctQXNzZXQlMjBGb3JnZS9hcHBzL2ctYXNzZXQtZm9yZ2Uvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgY2hlY2tlciBmcm9tICd2aXRlLXBsdWdpbi1jaGVja2VyJztcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCksIGNoZWNrZXIoeyB0eXBlc2NyaXB0OiB0cnVlIH0pXSxcclxuICBiYXNlOiAnLi8nLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNjE2NyxcclxuICAgIGhvc3Q6IHRydWUsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiAnYnVpbGQnLFxyXG4gICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcclxuICB9LFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAZy1hc3NldC1mb3JnZS9jb3JlJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9jb3JlL3NyYycpLFxyXG4gICAgICAnQGctYXNzZXQtZm9yZ2UvY29tbW9uJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjJyksXHJcbiAgICAgICdAZy1hc3NldC1mb3JnZS9nZW8nOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2dlby9zcmMnKSxcclxuICAgICAgJ0BnLWFzc2V0LWZvcmdlL2ljb25zJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9pY29ucy9zcmMnKSxcclxuICAgICAgJ0BnLWFzc2V0LWZvcmdlL2NvbXBvbmVudHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL2NvbXBvbmVudHMvc3JjJyksXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThULE9BQU8sV0FBVztBQUNoVixTQUFTLGVBQWU7QUFDeEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxhQUFhO0FBSHBCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxFQUFFLFlBQVksS0FBSyxDQUFDLENBQUM7QUFBQSxFQUNoRCxNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCx1QkFBdUIsUUFBUSxrQ0FBVyx5QkFBeUI7QUFBQSxNQUNuRSx5QkFBeUIsUUFBUSxrQ0FBVywyQkFBMkI7QUFBQSxNQUN2RSxzQkFBc0IsUUFBUSxrQ0FBVyx3QkFBd0I7QUFBQSxNQUNqRSx3QkFBd0IsUUFBUSxrQ0FBVywwQkFBMEI7QUFBQSxNQUNyRSw2QkFBNkIsUUFBUSxrQ0FBVywrQkFBK0I7QUFBQSxJQUNqRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
