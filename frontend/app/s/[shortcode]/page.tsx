import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ shortcode: string }>;
};

export default async function ShortcodeRedirectPage({ params }: Props) {
  const { shortcode } = await params;
  redirect(`/api/s/${shortcode}`);
}
