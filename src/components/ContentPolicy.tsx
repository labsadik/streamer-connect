// ContentPolicy.tsx - For display only (no checkbox)
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ContentPolicy() {
  return (
    <div className="w-full">
      <h3 className="font-semibold text-lg mb-3">NoorCast Content Policy</h3>
      
      <ScrollArea className="h-64 w-full rounded-md border p-4 mb-4">
        <div className="space-y-4 text-sm">
          <p>
            At NoorCast, we are committed to providing a safe, informative, and spiritually uplifting platform for our users. To ensure a positive experience for all, we have established the following content guidelines:
          </p>
          
          <div>
            <h5 className="font-medium">1. General Guidelines</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Content must align with Islamic values and promote positivity, knowledge, and spiritual growth.</li>
              <li>Content that includes hate speech, violence, discrimination, or harmful ideologies is strictly prohibited.</li>
              <li>Users are encouraged to share authentic, verified information to maintain trust and credibility within the platform.</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium">2. Sensitive Content Policy</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Content containing nudity, explicit material (18+), or extreme distractions is strictly forbidden.</li>
              <li>Any uploaded content that violates these guidelines will be reviewed and suspended within 24 hours of detection.</li>
              <li>Creators found posting sensitive or inappropriate content will face the following actions:</li>
              <ul className="list-disc pl-8 space-y-1">
                <li>First Violation: Warning and content removal.</li>
                <li>Second Violation: Temporary suspension of posting privileges.</li>
                <li>Third Violation: Permanent suspension of the creator's account.</li>
              </ul>
              <li>In cases where content violates national or international laws, NoorCast reserves the right to:</li>
              <ul className="list-disc pl-8 space-y-1">
                <li>Report the offending content and user details to relevant authorities for legal action.</li>
                <li>Cooperate fully with law enforcement to ensure compliance with applicable regulations.</li>
                <li>Pursue legal proceedings against individuals deliberately violating our content policies.</li>
              </ul>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium">3. News and Media Policy</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>NoorCast encourages sharing world updates and news to keep the community informed. However, any misleading or harmful content will be promptly reviewed and may be removed.</li>
              <li>Users are responsible for ensuring their content is accurate, appropriate, and respectful.</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium">4. Community Engagement</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>NoorCast promotes meaningful discussions, collaboration, and engagement. Users are encouraged to interact respectfully and avoid harassment, bullying, or offensive language.</li>
              <li>Any content aimed at disrupting the platform's peace or causing conflict will be subject to moderation.</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium">5. Platform Integration</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>NoorCast seamlessly integrates features inspired by popular platforms like Facebook and YouTube, providing users with a familiar yet tailored experience for Islamic content.</li>
              <li>While content sharing is encouraged, users must adhere to our content guidelines to maintain platform integrity.</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium">6. Reporting and Enforcement</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>Users are encouraged to report any content that violates this policy for prompt review.</li>
              <li>NoorCast reserves the right to review, remove, or suspend any content or user account that breaches these guidelines.</li>
              <li>Serious violations that involve unlawful content will result in NoorCast working with authorities to ensure legal accountability.</li>
            </ul>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}