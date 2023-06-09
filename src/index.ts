import { ModuleExports } from "@medusajs/modules-sdk"

import { MemcachedCacheService } from "./services"

const service = MemcachedCacheService
const loaders = []

const moduleDefinition: ModuleExports = {
  service,
  loaders,
}

export default moduleDefinition
