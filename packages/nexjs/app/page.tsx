"use client"
import {
  useAuthModal,
  useLogout,
  useSignerStatus,
  useUser,
  type UseSendUserOperationResult,
  useSendUserOperation,
  useSmartAccountClient,
} from "@account-kit/react"
import { IDKitWidget, ISuccessResult, VerificationLevel } from "@worldcoin/idkit"
import { encodeFunctionData, decodeAbiParameters } from "viem"
import { useState } from "react"

export default function Home () {
  const user = useUser()
  const { openAuthModal } = useAuthModal()
  const signerStatus = useSignerStatus()
  const { logout } = useLogout()
  const [result, setResult] = useState<ISuccessResult>()

  const { client } = useSmartAccountClient({ type: "LightAccount" })

  // const result = {
  //   "proof": "0x2d716b8ba451fdea2cdde50c848a0d79fbb8be847c90463af7aaa969d05c38070762b1663aaa77af6d6ec446d0d0715c2858dc460af0614d4931bc13cd96422e0bd6a1c34ea053181aa5d133a835678f0a8297dfba2d15e52f7a4e80557747e42b34ad63b5e391b8ff8081afd2cb2f92a5feabcfb338b372f387ccb2fd4003b92d7f8109337f9d5f080ef4778b0b3dc230fd362cdc1205439cf5d8ea81ee0b8f2815b06c1eef7f2ff698d24316cd78891adaa1bf7a744ebe56226dfbce13037d2573783c19e93d74847551968e018933f8f7b321a7b4d95ee830a78b1448908c2bd9999499c994fc259f0f0f28705f98876fa547e788c91292eb9ba4fd2737af",
  //   "merkle_root": "0x257daf7c70a9e63e58bccf5bd9cdaf333466904111819daa0de31c0bcb278e12",
  //   "nullifier_hash": "0x16039b7d4dae91afd3a4e7ea1def710891c80500ab2377c6922b36ae4f3d6741",
  //   "verification_level": VerificationLevel.Orb
  // }

  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    retry: 2,
    retryDelay: 2000,
    onSuccess: ({ hash, request }) => {
      // [optional] Do something with the hash and request
      console.log("sendUserOperation: onSuccess", hash, request)
    },
    onError: (error) => {
      // [optional] Do something with the error
      console.error("sendUserOperation: onError", error)
    },
  })

  function onSuccess (result: ISuccessResult) {
    console.log("IDKitWidget: onSuccess", result)

    setResult(result)
  }

  function submitProof() {
    if (!result) return;

    const abi = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_signal",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_root",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_nullifierHash",
            "type": "uint256"
          },
          {
            "internalType": "uint256[8]",
            "name": "_proof",
            "type": "uint256[8]"
          }
        ],
        "name": "verify",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
    ]
    const data = encodeFunctionData({
      abi,
      functionName: "verify",
      args: [
        user!.address,
        result.merkle_root,
        result.nullifier_hash,
        decodeAbiParameters(
          [{ type: "uint256[8]" }],
          result.proof as `0x${string}`
        )[0]
      ],
    });

    sendUserOperation({
      uo: {
        target: process.env.NEXT_PUBLIC_VERIFIER_ADDRESS! as `0x${string}`,
        data
      },
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-4 justify-center text-center">
      {signerStatus.isInitializing ? (
        <>Loading...</>
      ) : user ? (
        <div className="flex flex-col gap-2 p-2">
          <p className="text-xl font-bold">Success!</p>
          <p>{user.address}</p>
          You're logged in as {user.email ?? "anon"}.
          {result ? (
            <button className="btn btn-primary mt-6" onClick={submitProof} disabled={isSendingUserOperation}>
              Submit Proof
            </button>
          ) : (
            <div>
              <IDKitWidget
                app_id={process.env.NEXT_PUBLIC_WORLD_ID_APP_ID!}
                action={process.env.NEXT_PUBLIC_WORLD_ID_ACTION_ID!}
                signal={user.address}
                onSuccess={onSuccess}
              >
                {({ open }) => <button className="btn btn-primary mt-6" onClick={open}>Verify with World ID</button>}
              </IDKitWidget>
            </div>
          )
          }
          <button className="btn btn-secondary mt-6" onClick={() => logout()}>
            Log out
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={openAuthModal}>
          Login
        </button>
      )}
    </main>
  )
}
