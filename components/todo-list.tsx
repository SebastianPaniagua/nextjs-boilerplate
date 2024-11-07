'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, QrCode, Eye, EyeOff } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface TodoItem {
  id: number
  title: string
  timestamp: string
  type: 'CNC' | 'Accesorio'
  amount: number
  isDeleting: boolean
}

export function TodoList() {
  const router = useRouter()
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [addTodoOpen, setAddTodoOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [isButtonEnabled, setIsButtonEnabled] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/');
    } else {
      //workaround for react-qr-code cam error
      const cameFromCamera = localStorage.getItem("cameFromCamera");
      console.log("cameFromCamera" + cameFromCamera);
      if(cameFromCamera == "1"){
        localStorage.setItem("cameFromCamera", "0")
        window.location.reload();
      }
    }
  }, [router]);

  const formatDate = () => {
    const now = new Date()
    const date = now.toLocaleDateString('es', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const time = now.toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return `${date} @${time}`
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newTodo: TodoItem = {
      id: Date.now(),
      title: formData.get('title') as string,
      timestamp: formatDate(),
      type: formData.get('type') as 'CNC' | 'Accesorio',
      amount: Number(formData.get('price')),
      isDeleting: false
    }
    setTodos(prev => [...prev, newTodo])
    setAddTodoOpen(false)
  }

  const handleDelete = (id: number) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, isDeleting: true } : todo
    ))
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

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate new password
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 8 caracteres.",
        variant: "destructive",
      })
      return
    }

    // Check if new password contains at least one number and one special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/
    if (!passwordRegex.test(newPassword)) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe contener al menos un número y un carácter especial.",
        variant: "destructive",
      })
      return
    }

    // Confirm passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }

    // If all validations pass, we would typically send this to a backend
    // For this example, we'll just show a success message
    toast({
      title: "Éxito",
      description: "La contraseña se ha cambiado correctamente.",
    })

    // Reset form
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setProfileOpen(false)
  }

  const handleQrCodeClick = () => {
    router.push('/qrcodereader')
  }  

  useEffect(() => {
    const timer = setTimeout(() => {
      setTodos(prev => prev.filter(todo => !todo.isDeleting))
    }, 300) // Match this with the CSS transition duration

    return () => clearTimeout(timer)
  }, [todos])

  useEffect(() => {
    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      setPasswordError('')
      setIsButtonEnabled(true)
    } else {
      setIsButtonEnabled(false)
      if (confirmPassword && newPassword !== confirmPassword) {
        setPasswordError('Las contraseñas no coinciden.')
      } else {
        setPasswordError('')
      }
    }
  }, [newPassword, confirmPassword])

  return (
    <div className="w-full max-w-[600px] mx-auto p-4 sm:p-6">
      <div className="flex justify-between mb-8">
      <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="p-2 h-auto w-auto hover:bg-gray-100 transition-colors duration-200"
                onClick={handleQrCodeClick}
              >
                <QrCode className="h-6 w-6" />
                <span className="sr-only">QR Code Reader</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open QR Code Reader</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex gap-4">
          <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost">MI PERFIL</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambiar Contraseña</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!isButtonEnabled}>Cambiar Contraseña</Button>
                {passwordError && (
                  <p className="text-sm text-red-500 mt-2">{passwordError}</p>
                )}
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" onClick={handleLogout}>SALIR</Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 gap-x-[60px]">
        <h1 className="text-xl font-bold">MIS TRABAJOS</h1>
        <Dialog open={addTodoOpen} onOpenChange={setAddTodoOpen}>
          <DialogTrigger asChild>
            <Button>AGREGAR +</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Trabajo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Trabajo</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input id="price" name="price" type="number" required />
              </div>
              <div className="space-y-2">
                <Label>Fecha y Hora</Label>
                <Input value={formatDate()} disabled />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <RadioGroup name="type" defaultValue="CNC" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CNC" id="cnc" />
                    <Label htmlFor="cnc">CNC</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Accesorio" id="accesorio" />
                    <Label htmlFor="accesorio">Accesorio</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button type="submit" className="w-full">Agregar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center justify-between p-4 border-2 rounded-lg ${
              todo.type === 'CNC' ? 'border-[#4377EF]' : 'border-[#27A29C]'
            } transition-all duration-300 ${
              todo.isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <div className="space-y-1">
              <h3 className="font-medium">{todo.title}</h3>
              <p className="text-sm text-muted-foreground">{todo.timestamp}</p>
              <p className="text-sm font-medium">{todo.type}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">$ {todo.amount}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(todo.id)}
              >
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}