export interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface SupplierAddress {
  street: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface SupplierContact {
  contact_person: string;
  phone: string;
  email: string;
  address: SupplierAddress;
}

export interface SupplierData {
  name: string;
  document_type: string;
  document_number: string;
  contact: SupplierContact;
  notes: string;
}

export interface SupplierResponse extends SupplierData {
  _id: string;
  created_at: string;
  updated_at: string;
}
