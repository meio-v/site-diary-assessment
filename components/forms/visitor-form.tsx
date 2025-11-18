'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Check, X, Building2, Mail, Phone, FileText } from 'lucide-react'

interface VisitorFormData {
  name: string
  company_name: string
  purpose_of_visit: string
  email: string
  contact_details: string
}

interface VisitorFormProps {
  data: VisitorFormData
  onChange: (data: VisitorFormData) => void
  onSave: () => void
  onCancel: () => void
  loading?: boolean
  showActions?: boolean
}

export function VisitorForm({
  data,
  onChange,
  onSave,
  onCancel,
  loading = false,
  showActions = true,
}: VisitorFormProps) {
  return (
    <div className="flex-1 space-y-2">
      {showActions && (
        <div className="flex items-center gap-2">
          <Input
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Visitor name *"
            className="flex-1"
            required
            disabled={loading}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={onSave}
            disabled={loading}
            className="h-8 w-8"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!showActions && (
        <Input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Visitor name *"
          className="flex-1"
          required
          disabled={loading}
        />
      )}
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={data.company_name}
          onChange={(e) => onChange({ ...data, company_name: e.target.value })}
          placeholder="Company name (optional)"
          className="w-full pl-9"
          disabled={loading}
        />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="email"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          placeholder="Email (optional)"
          className="w-full pl-9"
          disabled={loading}
        />
      </div>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={data.contact_details}
          onChange={(e) => onChange({ ...data, contact_details: e.target.value })}
          placeholder="Contact details (optional)"
          className="w-full pl-9"
          disabled={loading}
        />
      </div>
      <div className="relative">
        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Textarea
          value={data.purpose_of_visit}
          onChange={(e) => onChange({ ...data, purpose_of_visit: e.target.value })}
          placeholder="Purpose of visit (optional)"
          className="w-full pl-9"
          rows={2}
          disabled={loading}
        />
      </div>
    </div>
  )
}

