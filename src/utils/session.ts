
import { getServerSession } from "next-auth";
import authOptions from './authOptions';

const loadSession = async () => {
  const session = await getServerSession(authOptions);
  return session;
};

export default loadSession;
