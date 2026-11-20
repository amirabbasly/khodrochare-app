"use client";
import {useSearchParams} from 'next/navigation';
import {HallChat} from './HallChat';
export function HallChatPage(){const params=useSearchParams(),uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;const listing=params.get('listing')||'',conversation=params.get('conversation')||'';return <HallChat key={listing+conversation} listingId={uuid.test(listing)?listing:undefined} conversationId={uuid.test(conversation)?conversation:undefined}/>;}
