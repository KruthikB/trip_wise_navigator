
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

export default function BookingModal({ isOpen, onClose, onConfirm, itinerary }: BookingModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  
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
                  <Input id="card-number" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="upi">
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="upi-id">UPI ID</Label>
                  <Input id="upi-id" placeholder="yourname@bank" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onConfirm}>
            Pay & Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
