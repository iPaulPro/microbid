import {
  AlchemyAccountsUIConfig,
  cookieStorage,
  createConfig,
} from "@account-kit/react"
import { baseSepolia } from "@account-kit/infra"
import { QueryClient } from "@tanstack/react-query"

const uiConfig: AlchemyAccountsUIConfig = {
  auth: {
    sections: [[{ type: "email" as const }]],
    addPasskeyOnSignup: false,
    header: "Sign in with email",
    hideSignInText: true
  },
}

export const config = createConfig(
  {
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
    policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY!,
    chain: baseSepolia,
    ssr: true,
    storage: cookieStorage,
  },
  uiConfig
)

export const queryClient = new QueryClient()
