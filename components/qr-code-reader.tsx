'use client'

import React, { useState } from 'react'
import { QrReader } from 'react-qr-reader'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode } from "lucide-react"
import { toast } from '@/hooks/use-toast'

export default function Component() {
  const [startScan, setStartScan] = useState(false)
  const router = useRouter()

  const handleScan = (result: any) => {
    if (result) {
      // Store the result in local storage
      localStorage.setItem('qrCodeResult', result.text)
      localStorage.setItem('cameFromCamera', "1")
      
      // Stop scanning
      setStartScan(false)

      // Redirect to the todo-list page
      router.push('/todo-list')
    }
  }

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      
      // Send POST request to logout endpoint
      //const response = await fetch('http://localhost:8055/auth/logout', {
      const response = await fetch('https://serval-dashing-immensely.ngrok-free.app/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      // Delete tokens from localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
            <div className="flex justify-between mb-8">
              <div className="p-2">
                
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" onClick={handleLogout}>SALIR</Button>
              </div>
            </div>          
          <CardTitle className="text-2xl font-bold text-center">QR Code Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!startScan && (
              <div className="flex justify-center">
                <QrCode size={128} className="text-primary" />
              </div>
            )}
            {startScan ? (
              <div className="aspect-square">
                <QrReader
                  onResult={handleScan}
                  constraints={{ facingMode: 'environment' }}
                  videoId="video"
                  scanDelay={300}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <Button 
                onClick={() => setStartScan(true)}
                className="w-full"
              >
                Escanear QR
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}