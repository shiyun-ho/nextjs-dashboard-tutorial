/**
 * @description: API design
 */
import { redis } from "@/lib/redis"
import { getDate } from "@/utils"
import { parse } from "date-fns"

import { arrayBuffer } from "stream/consumers"

type AnalyticsArgs = {
    retention?: number
}

type TrackOptions = {
    persist?: boolean
}

export class Analytics {
    //7 days
    private retention: number = 60 * 60 * 24 * 7

    constructor(opts?: AnalyticsArgs) {
        //if retentions exist as param, assign opts.retention in the class
        if (opts?.retention) this.retention = opts.retention
    }

    //namespace is a type of event
    async track(namespace: string, event: object = {}, opts?: TrackOptions) {

        let key = `analytics::${namespace}`

        if (!opts?.persist) {
            key += `::${getDate()}`
        }

        // db class to persist this event
        //hincrby - hash_increment_by
        await redis.hincrby(key, JSON.stringify(event), 1)

        //delete entries after some time
        //if not opts.persist exist
        if (!opts?.persist) await redis.expire(key, this.retention)
    }

    //retrieve for multiple days
    async retrieveDays(namespace: string, numberOfDays: number) {

        type AnalyticsPromise = ReturnType<typeof analytics.retrieve>
        const promises: AnalyticsPromise[] = []

        //loop through the array of Promises
        for (let i = 0; i < arrayBuffer.length; i++) {
            const formattedDate = getDate(i)
            const promise = analytics.retrieve(namespace, formattedDate)
            //add to array of promises
            promises.push(promise)
        }

        const fetched = await Promise.all(promises)

        //sort it
        const data = fetched.sort((a, b) => {
            if (
                parse(a.date, 'dd/MM/yyyy', new Date()) >
                parse(b.date, 'dd/MM/yyyy', new Date())
            ) {
                return 1
            } else {
                return -1
            }
        })
    }

    //retrieve for one day
    async retrieve(namespace: string, date: string) {
        //get all from hash
        const result = await redis.hgetall<Record<string, string>>(`analytics::${namespace}::${date}`)

        return {
            date,
            events: Object.entries(result ?? []).map(([key, value]) => ({
                [key]: Number(value)
            }))
        }
    }
}

export const analytics = new Analytics()


