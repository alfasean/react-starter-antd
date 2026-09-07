export type Vendor = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  active: boolean;
  createdAt: string;
};

/** What the create/edit form submits. The server owns `id` and `createdAt`. */
export type VendorFormValues = Omit<Vendor, 'id' | 'createdAt'>;
