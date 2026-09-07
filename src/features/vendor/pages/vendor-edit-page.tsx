import { Edit } from '@refinedev/antd';

import { VendorForm } from '../components/vendor-form';
import { useVendorForm } from '../hooks/use-vendor-form';

export default function VendorEditPage() {
  const { formProps, saveButtonProps, formLoading } = useVendorForm('edit');

  return (
    <Edit title="Edit vendor" saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <VendorForm formProps={formProps} />
    </Edit>
  );
}
