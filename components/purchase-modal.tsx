"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"

interface PurchaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    name: string
    price: number
    quantity: number
    duration: string
  } | null
}

const ESCROW_CONTRACT_ADDRESS = "0x69ba0851c4b8Ed0ee8e752fdDca36c4Bf85Af17F" as `0x${string}`

export function PurchaseModal({ open, onOpenChange, item }: PurchaseModalProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const { address, isConnected } = useAccount()
  const { data: hash, sendTransaction, isPending, error } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  if (!item) return null

  const totalCost = (item.price * item.quantity).toFixed(6)
  const totalCostWei = parseEther(totalCost)

  const handleConfirmPurchase = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first")
      return
    }

    try {
      await sendTransaction({
        to: ESCROW_CONTRACT_ADDRESS,
        value: totalCostWei,
      })
    } catch (err) {
      console.error("Transaction failed:", err)
    }
  }

  // Show success when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && !showSuccess) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onOpenChange(false)
      }, 3000)
    }
  }, [isConfirmed, showSuccess, onOpenChange])

  const handleClose = () => {
    setShowSuccess(false)
    onOpenChange(false)
  }

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-zinc-950 border-zinc-800 max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">Purchase Successful!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="p-4 bg-black rounded-lg border border-zinc-800 space-y-2">
              <p className="text-zinc-400">Amount Spent</p>
              <div className="flex items-center justify-center gap-2">
                <img src="/images/celo.png" alt="CELO" className="w-6 h-6" />
                <span className="text-2xl font-bold">{totalCost} CELO</span>
              </div>
            </div>

            <div className="p-4 bg-black rounded-lg border border-zinc-800 space-y-2">
              <p className="text-zinc-400">Item Purchased</p>
              <p className="text-lg font-semibold">
                {item.quantity}x {item.name}
              </p>
            </div>

            <div className="p-4 bg-green-950/20 rounded-lg border border-green-800 space-y-2">
              <p className="text-zinc-400">Effect</p>
              <p className="text-lg font-semibold text-green-400">{getEffectMessage(item)}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>Review your purchase before confirming</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-black rounded-lg border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Item</span>
              <span className="font-semibold">{item.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Quantity</span>
              <span className="font-semibold">{item.quantity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Description</span>
              <span className="text-sm text-zinc-300">{item.duration}</span>
            </div>
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Total Cost</span>
              <div className="flex items-center gap-2">
                <img src="/images/celo.png" alt="CELO" className="w-5 h-5" />
                <span className="text-xl font-bold">{totalCost} CELO</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-yellow-950/20 rounded-lg border border-yellow-800">
            <p className="text-sm text-yellow-200">
              ⚠️ This item will be consumed immediately after purchase and cannot be refunded.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 rounded-lg border border-red-800">
              <p className="text-sm text-red-200">Error: {error.message}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1 border-zinc-700 bg-transparent" disabled={isPending || isConfirming}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmPurchase} 
              className="flex-1 bg-white text-black hover:bg-zinc-200"
              disabled={isPending || isConfirming || !isConnected}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? "Confirming..." : "Processing..."}
                </>
              ) : (
                "Confirm Purchase"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getEffectMessage(item: { name: string; quantity: number; duration: string }) {
  if (item.name.includes("Revive Potion")) {
    return "Your fox has been revived!"
  }
  if (item.name.includes("Golden Fish")) {
    return `Boosted your winning chances by ${item.quantity}x!`
  }
  if (item.name.includes("1 Fish")) {
    return `Fed your fox for ${item.quantity} day${item.quantity > 1 ? "s" : ""}!`
  }
  if (item.name.includes("Box of 7 Fish")) {
    return `Fed your fox for ${item.quantity} week${item.quantity > 1 ? "s" : ""}!`
  }
  if (item.name.includes("Box of 15 Fish")) {
    return `Fed your fox for ${item.quantity * 2} weeks!`
  }
  return "Item successfully applied!"
}
