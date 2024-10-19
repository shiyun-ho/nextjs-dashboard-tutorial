import { request } from "http"
import { MiddlewareNotFoundError } from "next/dist/shared/lib/utils"
import { NextRequest, NextResponse } from "next/server"
import { analytics } from "./utils/analytics"

export default async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/') {
        //track analytics events
        try {
            //track an event `track`
            analytics.track("pageview", {
                page: '/',
                country: request.geo?.country,
            })
        } catch (error) {
            //fail silently
            console.error(error)
        }
    }
    return NextResponse.next()
}

//nextJS to determine when middleware above will run
export const matcher = {
    matcher: ['/']
}
