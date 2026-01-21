import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Send, CheckCircle } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import Input from '../ui/Input'

function InquiryForm({ propertyId, propertyTitle }) {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      message: `Hola, estoy interesado/a en la propiedad "${propertyTitle}". Me gustaría obtener más información.`,
    },
  })

  const mutation = useMutation({
    mutationFn: (data) => api.createInquiry({ ...data, propertyId }),
    onSuccess: () => {
      setSubmitted(true)
      reset()
    },
  })

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">Mensaje enviado</h3>
        <p className="text-muted text-sm">
          Nos pondremos en contacto contigo pronto.
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Enviar otro mensaje
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
      <h3 className="font-semibold text-lg mb-4">Contactar al vendedor</h3>

      <Input
        label="Nombre"
        {...register('name', { required: 'El nombre es requerido' })}
        error={errors.name?.message}
      />

      <Input
        label="Correo electrónico"
        type="email"
        {...register('email', {
          required: 'El correo es requerido',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Correo inválido',
          },
        })}
        error={errors.email?.message}
      />

      <Input
        label="Teléfono (opcional)"
        type="tel"
        {...register('phone')}
      />

      <div>
        <label className="block text-sm font-medium text-secondary mb-1.5">
          Mensaje
        </label>
        <textarea
          {...register('message', { required: 'El mensaje es requerido' })}
          rows={4}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      {mutation.error && (
        <p className="text-sm text-red-500">{mutation.error.message}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        loading={mutation.isPending}
      >
        <Send className="w-4 h-4 mr-2" />
        Enviar mensaje
      </Button>
    </form>
  )
}

export default InquiryForm
