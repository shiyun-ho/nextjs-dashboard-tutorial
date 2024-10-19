import { analytics } from "@/utils/analytics";

const Page = async () => {

    const pageView = await analytics.retrieveDays("pageView", 2)

    return <pre>{JSON.stringify(pageView)}</pre>;
}

export default Page