import { Listing, Host, Review, LocalAreaData, TrustResult } from '@/types';
import fs from 'fs';
import path from 'path';
import { getAwsConfig } from './aws/config';
import { saveTrustResultToDynamoDb } from './aws/dynamodb';

const DATA_DIR = path.join(process.cwd(), 'data');

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function getListings(): Listing[] {
  return readJsonFile<Listing[]>('listings.json');
}

export function getListingById(id: string): Listing | undefined {
  const listings = getListings();
  return listings.find(l => l.id === id);
}

export function getHosts(): Host[] {
  return readJsonFile<Host[]>('hosts.json');
}

export function getHostById(id: string): Host | undefined {
  const hosts = getHosts();
  return hosts.find(h => h.id === id);
}

export function getReviews(): Review[] {
  return readJsonFile<Review[]>('reviews.json');
}

export function getReviewsByListingId(listingId: string): Review[] {
  const reviews = getReviews();
  return reviews.filter(r => r.listingId === listingId);
}

export function getLocalAreaData(): LocalAreaData[] {
  return readJsonFile<LocalAreaData[]>('localArea.json');
}

export function getLocalAreaDataByArea(area: string): LocalAreaData | undefined {
  const data = getLocalAreaData();
  return data.find(d => d.area === area);
}

export function getTrustResult(listingId: string): TrustResult | undefined {
  try {
    const results = readJsonFile<TrustResult[]>('trustResults.json');
    return results.find(r => r.listingId === listingId);
  } catch {
    return undefined;
  }
}

export function saveTrustResult(result: TrustResult): void {
  // 1. Save to local JSON cache
  let results: TrustResult[] = [];
  try {
    results = readJsonFile<TrustResult[]>('trustResults.json');
  } catch {
    results = [];
  }
  const index = results.findIndex(r => r.listingId === result.listingId);
  if (index >= 0) {
    results[index] = result;
  } else {
    results.push(result);
  }
  writeJsonFile('trustResults.json', results);

  // 2. Persist to AWS DynamoDB Table
  saveTrustResultToDynamoDb(result).catch((err) => {
    console.warn('AWS DynamoDB async save note:', err.message);
  });
}

export function getAllTrustResults(): TrustResult[] {
  try {
    return readJsonFile<TrustResult[]>('trustResults.json');
  } catch {
    return [];
  }
}