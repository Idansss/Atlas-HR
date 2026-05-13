import { Column, Img, Link, Row, Section, Text } from "@react-email/components";
import { Button } from "../_components/Button";
import { Heading } from "../_components/Heading";
import { Layout } from "../_components/Layout";
import { Paragraph } from "../_components/Paragraph";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDcdzqm8cE2CV0nw58VpNwHnluVx115AdIt3KvGbiWA9w4y9kDsnpyFd9g357N4aK2-nmlWWK6jHdakbclKXXQEpXXsEDGwtof8nhiR7jH3QbtDxVZswYlEpkMtVyhqzPrrHx_i8zo1uL_yQfSaFC-i47mDQ3ilWQCQSSTdwhG3SeDosTBfNuz-TLLI1yeQHd-l--JjtZEVeAnpFMxnh_RBe_FmVoHY30SEbukJlVptEvwAW_urPsL7jFra9CN4aBH6OW5cw9_CEts";

const featureCardStyle = {
  backgroundColor: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: "16px",
  width: "50%",
} as const;

export function Welcome({
  firstName,
  dashboardUrl,
}: {
  firstName: string;
  dashboardUrl: string;
}) {
  return (
    <Layout preview={`Welcome to Atlas HR, ${firstName}. Here's what to do next.`}>
      <Section
        style={{
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          overflow: "hidden",
          margin: "0 0 24px",
        }}
      >
        <Img
          src={heroImage}
          width="478"
          height="240"
          alt="A diverse professional team collaborating in a bright modern office."
          style={{
            display: "block",
            height: 240,
            objectFit: "cover",
            width: "100%",
          }}
        />
      </Section>

      <Section style={{ textAlign: "center" }}>
        <Heading>Welcome to Atlas HR, {firstName}!</Heading>
        <Paragraph>
          We&apos;re excited to have you join our global HR community. Atlas HR helps you manage your team with local expertise, whether you&apos;re in Nigeria, India, Kenya, or the Philippines.
        </Paragraph>
        <Section style={{ padding: "8px 0 24px" }}>
          <Button href={dashboardUrl}>Get Started</Button>
        </Section>
      </Section>

      <Row style={{ margin: "8px 0 24px" }}>
        <Column style={{ ...featureCardStyle, paddingRight: 8 }}>
          <Text style={{ color: "#2563EB", fontSize: 24, lineHeight: "24px", margin: "0 0 8px" }}>
            &#10003;
          </Text>
          <Text
            style={{
              color: "#64748B",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              lineHeight: "16px",
              margin: "0 0 6px",
              textTransform: "uppercase",
            }}
          >
            Compliance
          </Text>
          <Text style={{ color: "#475569", fontSize: 14, lineHeight: "20px", margin: 0 }}>
            Localized contracts, policies, and guidance for distributed teams.
          </Text>
        </Column>
        <Column style={{ width: 12 }} />
        <Column style={featureCardStyle}>
          <Text style={{ color: "#2563EB", fontSize: 24, lineHeight: "24px", margin: "0 0 8px" }}>
            $
          </Text>
          <Text
            style={{
              color: "#64748B",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              lineHeight: "16px",
              margin: "0 0 6px",
              textTransform: "uppercase",
            }}
          >
            Payroll
          </Text>
          <Text style={{ color: "#475569", fontSize: 14, lineHeight: "20px", margin: 0 }}>
            Practical workflows for global teams paying people in local currency.
          </Text>
        </Column>
      </Row>

      <Section
        style={{
          backgroundColor: "#DBEAFE",
          border: "1px solid #BFDBFE",
          borderRadius: 12,
          padding: "16px",
          textAlign: "center",
        }}
      >
        <Text style={{ color: "#1E40AF", fontSize: 13, fontWeight: 700, lineHeight: "20px", margin: "0 0 6px" }}>
          Empowering global teams
        </Text>
        <Text style={{ color: "#475569", fontSize: 13, lineHeight: "20px", margin: 0 }}>
          Need help getting started? Reply to this email or visit the{" "}
          <Link href={`${dashboardUrl.replace(/\/dashboard$/, "")}/help`} style={{ color: "#2563EB", fontWeight: 700 }}>
            Help Center
          </Link>
          .
        </Text>
      </Section>
    </Layout>
  );
}

export default Welcome;
