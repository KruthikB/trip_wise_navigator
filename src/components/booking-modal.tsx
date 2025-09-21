
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Landmark } from 'lucide-react';
import type { Itinerary } from '@/lib/types';
import { useState } from 'react';

type BookingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itinerary: Itinerary;
};

type ValidationErrors = {
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  upi?: string;
};

export default function BookingModal({ isOpen, onClose, onConfirm, itinerary }: BookingModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateCardDetails = () => {
    const newErrors: ValidationErrors = {};

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits.';
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      newErrors.expiry = 'Invalid format. Use MM/YY.';
    } else {
      const [month, year] = expiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year, 10), parseInt(month, 10) - 1);
      const lastDayOfMonth = new Date(expiryDate.getFullYear(), expiryDate.getMonth() + 1, 0);
      if (lastDayOfMonth < new Date()) {
        newErrors.expiry = 'Card has expired.';
      }
    }

    if (cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits.';
    }

    return newErrors;
  };
  
  const validateUpiDetails = () => {
    const newErrors: ValidationErrors = {};
    if (!upiId.includes('@')) {
      newErrors.upi = 'Please enter a valid UPI ID.';
    }
    return newErrors;
  }

  const handleConfirm = () => {
    let validationErrors: ValidationErrors = {};
    if (selectedPaymentMethod === 'card') {
      validationErrors = validateCardDetails();
    } else {
      validationErrors = validateUpiDetails();
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onConfirm();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Your Booking</DialogTitle>
          <DialogDescription>
            You are booking a {itinerary.duration}-day trip to {itinerary.destination} for an estimated cost of {itinerary.budget}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="card" className="w-full" onValueChange={setSelectedPaymentMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card">
                <CreditCard className="mr-2 h-4 w-4" /> Credit/Debit Card
              </TabsTrigger>
              <TabsTrigger value="upi">
                <Landmark className="mr-2 h-4 w-4" /> UPI
              </TabsTrigger>
            </TabsList>
            <TabsContent value="card">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input 
                    id="card-number" 
                    placeholder="0000 0000 0000 0000" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                  {errors.cardNumber && <p className="text-xs text-destructive">{errors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input 
                      id="expiry" 
                      placeholder="MM/YY" 
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      maxLength={5}
                    />
                    {errors.expiry && <p className="text-xs text-destructive">{errors.expiry}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input 
                      id="cvv" 
                      placeholder="123" 
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={3}
                    />
                    {errors.cvv && <p className="text-xs text-destructive">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="upi">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="upi-id">UPI ID</Label>
                  <Input 
                    id="upi-id" 
                    placeholder="yourname@bank" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                  {errors.upi && <p className="text-xs text-destructive">{errors.upi}</p>}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setErrors({})}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm}>
            Pay & Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
