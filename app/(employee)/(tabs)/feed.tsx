import { FeedScreen } from '../../../components/feed/FeedScreen';
import { employeeFeedConfig } from '../../../components/feed/FeedConfiguration';

export default function EmployeeFeed() {
  return <FeedScreen config={employeeFeedConfig} />;
}
