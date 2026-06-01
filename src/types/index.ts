export interface BookingFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceIds: string[]
  stylistId: string
  date: string
  time: string
  notes?: string
}

export interface BookingSlot {
  time: string
  available: boolean
}
