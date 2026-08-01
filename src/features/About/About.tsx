import {
  ArrowDownTrayIcon,
  BugAntIcon,
  ChatBubbleLeftEllipsisIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  LanguageIcon,
  LightBulbIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"
import { Info } from "lucide-react"
import { useTranslation } from "react-i18next"

import FeatureList from "~/components/FeatureList"
import LinkCard from "~/components/LinkCard"
import { PageHeader } from "~/components/PageHeader"
import { ReleaseUpdateStatusPanel } from "~/components/ReleaseUpdateStatusPanel"
import { Heading4 } from "~/components/ui"
import {
  FEATURES,
  FUTURE_FEATURES,
  LATEST_RELEASE_URL,
  NIGHTLY_RELEASE_URL,
} from "~/constants/about"
import { isNotEmptyArray } from "~/utils"
import { getDocsHomepageUrl } from "~/utils/navigation/docsLinks"
import { getFeedbackDestinationUrls } from "~/utils/navigation/feedbackLinks"
import { getPkgVersion } from "~/utils/navigation/packageMeta"
import packageJson from "~~/package.json"

import CreditsCard from "./components/CreditsCard"
import PluginIntroCard from "./components/PluginIntroCard"
import PrivacyNotice from "./components/PrivacyNotice"
import TechStackGrid from "./components/TechStackGrid"

/**
 * Options/About page: displays app metadata, links, features, tech stack, credits, and privacy notice.
 */
export default function About() {
  const { t, i18n } = useTranslation("about")
  const version = packageJson.version

  // 从工具函数获取元数据
  const homepage = getDocsHomepageUrl(i18n.language)
  const feedbackDestinations = getFeedbackDestinationUrls(i18n.language)

  // 技术栈版本动态化
  const techStack = [
    {
      name: "WXT",
      version: getPkgVersion("wxt"),
      description: t("techStack.wxt"),
    },
    {
      name: "React",
      version: getPkgVersion("react"),
      description: t("techStack.react"),
    },
    {
      name: "TypeScript",
      version: getPkgVersion("typescript"),
      description: t("techStack.typescript"),
    },
    {
      name: "Tailwind CSS",
      version: getPkgVersion("tailwindcss"),
      description: t("techStack.tailwindcss"),
    },
    {
      name: "Radix UI",
      version: getPkgVersion("radix-ui"),
      description: t("techStack.radix"),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        icon={Info}
        title={t("title")}
        description={t("ui:app.description")}
      />

      <div className="space-y-6">
        {/* 插件信息 */}
        <section>
          <PluginIntroCard version={version} />
        </section>

        {/* 项目链接 */}
        <section>
          <Heading4 className="mb-4">{t("projectLinks")}</Heading4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LinkCard
              Icon={CodeBracketIcon}
              title={t("githubRepo")}
              description={t("githubDesc")}
              href={feedbackDestinations.repository}
              buttonText={t("starRepo")}
              buttonVariant="default"
              iconClass="text-gray-900 dark:text-gray-100"
            />
            <LinkCard
              Icon={GlobeAltIcon}
              title={t("homepage")}
              description={t("homepageDesc")}
              href={homepage}
              buttonText={t("visitHomepage")}
              buttonVariant="secondary"
              iconClass="text-blue-600 dark:text-blue-400"
            />
          </div>
        </section>

        <section>
          <Heading4 className="mb-4">{t("releaseUpdate.title")}</Heading4>
          <ReleaseUpdateStatusPanel />
        </section>

        <section>
          <Heading4 className="mb-4">{t("feedbackSection.title")}</Heading4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <LinkCard
              Icon={BugAntIcon}
              title={t("ui:feedback.bugReport")}
              description={t("feedbackSection.bugReport.description")}
              href={feedbackDestinations.bugReport}
              buttonText={t("feedbackSection.bugReport.button")}
              buttonVariant="default"
              iconClass="text-red-600 dark:text-red-400"
            />
            <LinkCard
              Icon={LightBulbIcon}
              title={t("ui:feedback.featureRequest")}
              description={t("feedbackSection.featureRequest.description")}
              href={feedbackDestinations.featureRequest}
              buttonText={t("feedbackSection.featureRequest.button")}
              buttonVariant="secondary"
              iconClass="text-amber-500 dark:text-amber-400"
            />
            <LinkCard
              Icon={LanguageIcon}
              title={t("ui:feedback.languageRequest")}
              description={t("feedbackSection.languageRequest.description")}
              href={feedbackDestinations.languageRequest}
              buttonText={t("feedbackSection.languageRequest.button")}
              buttonVariant="secondary"
              iconClass="text-indigo-600 dark:text-indigo-400"
            />
            <LinkCard
              Icon={UsersIcon}
              title={t("ui:feedback.community")}
              description={t("feedbackSection.community.description")}
              href={feedbackDestinations.community}
              buttonText={t("feedbackSection.community.button")}
              buttonVariant="outline"
              iconClass="text-emerald-600 dark:text-emerald-400"
            />
            <LinkCard
              Icon={ChatBubbleLeftEllipsisIcon}
              title={t("ui:feedback.discussion")}
              description={t("feedbackSection.discussion.description")}
              href={feedbackDestinations.discussions}
              buttonText={t("feedbackSection.discussion.button")}
              buttonVariant="outline"
              iconClass="text-blue-600 dark:text-blue-400"
            />
          </div>
        </section>

        {/* 个人增强版发布渠道 */}
        <section>
          <Heading4 className="mb-4">{t("personalReleases.title")}</Heading4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LinkCard
              Icon={ArrowDownTrayIcon}
              title={t("personalReleases.stable.title")}
              description={t("personalReleases.stable.description")}
              href={LATEST_RELEASE_URL}
              buttonText={t("personalReleases.stable.button")}
              buttonVariant="default"
              iconClass="text-blue-600 dark:text-blue-400"
            />
            <LinkCard
              Icon={ArrowDownTrayIcon}
              title={t("personalReleases.nightly.title")}
              description={t("personalReleases.nightly.description")}
              href={NIGHTLY_RELEASE_URL}
              buttonText={t("personalReleases.nightly.button")}
              buttonVariant="secondary"
              iconClass="text-indigo-600 dark:text-indigo-400"
            />
          </div>
        </section>

        {/* 功能特性 */}
        {isNotEmptyArray(FEATURES) && isNotEmptyArray(FUTURE_FEATURES) && (
          <section>
            <Heading4 className="mb-4">{t("features")}</Heading4>
            <div className="space-y-6">
              {/* 主要功能 */}
              <FeatureList
                title={t("implementedFeatures")}
                items={FEATURES}
                color="green"
              />

              {/* 未来功能 */}
              <FeatureList
                title={t("upcomingFeatures")}
                items={FUTURE_FEATURES}
                color="blue"
              />
            </div>
          </section>
        )}

        {/* 技术栈 */}
        <section>
          <Heading4 className="mb-4">{t("techStack.title")}</Heading4>
          <TechStackGrid items={techStack} />
        </section>

        {/* 版权和致谢 */}
        <section>
          <Heading4 className="mb-4">{t("copyrightAck")}</Heading4>
          <CreditsCard />
        </section>

        {/* 隐私声明 */}
        <section>
          <PrivacyNotice />
        </section>
      </div>
    </div>
  )
}
