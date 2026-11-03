import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ASSETS, isAssetSymbol } from "@/lib/config/assets";
import { AssetDetail } from "./asset-detail";

export async function generateMetadata({ params }: PageProps<"/assets/[asset]">): Promise<Metadata> {
  const symbol = (await params).asset.toUpperCase();
  return { title: isAssetSymbol(symbol) ? ASSETS[symbol].name : "Asset" };
}

export default async function AssetPage({ params }: PageProps<"/assets/[asset]">) {
  const symbol = (await params).asset.toUpperCase();
  if (!isAssetSymbol(symbol)) notFound();
  return <AssetDetail symbol={symbol} />;
}
