import { Create } from '@refinedev/antd';

import { VendorForm } from '../components/vendor-form';
import { useVendorForm } from '../hooks/use-vendor-form';

export default function VendorCreatePage() {
  const { formProps, saveButtonProps, formLoading } = useVendorForm('create');

  return (
    <Create title="New vendor" saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <VendorForm formProps={formProps} />
    </Create>
  );
}
