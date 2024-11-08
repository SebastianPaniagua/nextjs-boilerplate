'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const isValidEmail = email.length >= 6
  const isValidPassword = password.length >= 8
  const isFormValid = isValidEmail && isValidPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      //const response = await axios.post(`http://localhost:8055/auth/login`, { email, password })
      const response = await axios.post(`https://serval-dashing-immensely.ngrok-free.app/auth/login`, { email, password })
      if (response.data.data.access_token) {
        localStorage.setItem('access_token', response.data.data.access_token);
        localStorage.setItem('refresh_token', response.data.data.refresh_token);
        router.push('/qrcodereader') // Redirect to dashboard on successful login
      } else {
        setError('Invalid credentials')
      }
    } catch (error) {
      console.log(error);
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Ingreso</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingrese su email"
                />
                {email && !isValidEmail && (
                  <p className="text-sm text-red-500">Email must be at least 6 characters</p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Contrase&ntilde;a</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contrase&ntilde;a"
                />
                {password && !isValidPassword && (
                  <p className="text-sm text-red-500">Password must be at least 8 characters</p>
                )}
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            <Button className="w-full mt-6" type="submit" disabled={!isFormValid || isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            &#191;Olvid&#243; contrase&#241;a?
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}