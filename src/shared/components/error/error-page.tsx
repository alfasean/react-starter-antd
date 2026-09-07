import { Button, Result } from 'antd';
import { Link } from 'react-router';

type ErrorPageProps = {
  status?: '403' | '404' | '500';
  title?: string;
  subTitle?: string;
};

const DEFAULTS: Record<string, { title: string; subTitle: string }> = {
  '403': {
    title: 'Not allowed',
    subTitle: 'You do not have permission to view this page.',
  },
  '404': {
    title: 'Page not found',
    subTitle: 'The page you were looking for does not exist.',
  },
  '500': {
    title: 'Something went wrong',
    subTitle: 'An unexpected error occurred. Try again, or go back to the dashboard.',
  },
};

export function ErrorPage({ status = '404', title, subTitle }: ErrorPageProps) {
  const fallback = DEFAULTS[status];

  return (
    <Result
      status={status}
      title={title ?? fallback?.title}
      subTitle={subTitle ?? fallback?.subTitle}
      extra={
        <Link to="/">
          <Button type="primary">Back to dashboard</Button>
        </Link>
      }
    />
  );
}
