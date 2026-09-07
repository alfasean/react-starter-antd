import { Col, Form, Input, Row, Switch } from 'antd';
import type { FormProps } from 'antd';

import { vendorFormRules } from '../hooks/use-vendor-form';
import type { VendorFormValues } from '../types';

type VendorFormProps = {
  formProps: FormProps<VendorFormValues>;
};

/** Presentational: it renders fields and rules, and owns no state. */
export function VendorForm({ formProps }: VendorFormProps) {
  return (
    <Form
      {...formProps}
      layout="vertical"
      initialValues={{ active: true, ...formProps.initialValues }}
    >
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item label="Code" name="code" rules={vendorFormRules.code}>
            <Input placeholder="V-001" />
          </Form.Item>
        </Col>

        <Col xs={24} md={16}>
          <Form.Item label="Name" name="name" rules={vendorFormRules.name}>
            <Input placeholder="Vendor name" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Email" name="email" rules={vendorFormRules.email}>
            <Input placeholder="contact@vendor.test" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Phone" name="phone" rules={vendorFormRules.phone}>
            <Input placeholder="021-5500000" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="City" name="city" rules={vendorFormRules.city}>
            <Input placeholder="Jakarta" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Active" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
