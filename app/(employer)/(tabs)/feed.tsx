import { FeedScreen } from '../../../components/feed/FeedScreen';
import { employerFeedConfig } from '../../../components/feed/FeedConfiguration';

export default function EmployerFeed() {
  return <FeedScreen config={employerFeedConfig} />;
}
