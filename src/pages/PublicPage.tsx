import { Link, useParams } from 'react-router-dom';
import { useSupabaseData } from '../hooks/useSupabase';

export default function PublicPage() {
  const { slug } = useParams();
  const { data: profiles, loading: loadingProfile } = useSupabaseData<any>('profiles', `slug=eq.${slug}`);

  if (loadingProfile) {
    return <div>Loading...</div>;
  }

  if (!profiles || profiles.length === 0) {
    return <div>Profile not found</div>;
  }

  const profile = profiles[0];

  return (
    <div>
      <h1>{profile.name}</h1>
      <p>{profile.owner}</p>
      <p>{profile.address}</p>
      <p>{profile.phone}</p>
      <p>{profile.instagram}</p>
      <p>{profile.opening_hours}</p>
      <img src={profile.logo_url} alt="Logo" />
      <Link to="/">Back to Home</Link>
    </div>
  );
}
