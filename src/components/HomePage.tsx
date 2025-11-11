"use client";

import z from "zod";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";

import { GeolocationData, searchIPSchema } from "@/lib/schema";
import {
  getGeoInfoByIP,
  getUserIPInfo,
  getUserIPInfoByIP,
} from "@/lib/services/ip";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-lg mx-auto border flex items-center justify-center bg-gray-100 animate-pulse"></div>
  ),
});

export default function HomePage({
  onCreateHistory,
}: {
  onCreateHistory: (geolocationData: GeolocationData) => Promise<void>;
}) {
  const [searchedIP, setSearchedIP] = useState("");

  const { data: userIPData, isLoading: userIPDataIsLoading } = useQuery({
    queryKey: [""],
    queryFn: getUserIPInfo,
  });

  const { data: searchedIPData, isLoading: searchedIPDataIsLoading } = useQuery(
    {
      queryKey: [`searched-ip-${searchedIP}`],
      queryFn: () => getUserIPInfoByIP(searchedIP),
      enabled: !!searchedIP,
    }
  );

  const { data: geoInfoData, isLoading: geoInfoDataIsLoading } = useQuery({
    queryKey: [`ip-${userIPData?.ip}`],
    queryFn: () => getGeoInfoByIP(userIPData?.ip ?? ""),
    enabled: !!userIPData?.ip,
  });

  const { data: searchedGeoInfoData, isLoading: searchedGeoInfoDataIsLoading } =
    useQuery({
      queryKey: [`searched-ip-${searchedIP}-geo`],
      queryFn: () => getGeoInfoByIP(searchedIP),
      enabled: !!searchedIP,
    });

  const { mutate: saveSearchedData } = useMutation({
    mutationFn: onCreateHistory,
  });

  const form = useForm<z.infer<typeof searchIPSchema>>({
    resolver: zodResolver(searchIPSchema),
    defaultValues: {
      ip: "",
    },
  });

  const currentFormIP = useWatch({
    control: form.control,
    name: "ip",
  });

  async function onSubmit(values: z.infer<typeof searchIPSchema>) {
    setSearchedIP(values.ip);
  }

  function handleClearSearch() {
    setSearchedIP("");
    form.reset({
      ip: userIPData?.ip ?? "",
    });
  }

  useEffect(() => {
    if (userIPData?.ip && !searchedIP) {
      form.reset({
        ip: userIPData.ip,
      });
    }

    if (
      searchedIPData &&
      searchedGeoInfoData &&
      !searchedIPDataIsLoading &&
      !searchedGeoInfoDataIsLoading
    ) {
      const geolocationData = {
        ip: searchedIPData.ip,
        hostname: searchedIPData.hostname,
        city: searchedIPData.city,
        region: searchedIPData.region,
        country: searchedIPData.country,
        loc: searchedIPData.loc,
        org: searchedIPData.org,
        postal: searchedIPData.postal,
        timezone: searchedIPData.timezone,
        asn: searchedGeoInfoData.asn,
        as_name: searchedGeoInfoData.as_name,
        as_domain: searchedGeoInfoData.as_domain,
        country_code: searchedGeoInfoData.country_code,
        continent_code: searchedGeoInfoData.continent_code,
        continent: searchedGeoInfoData.continent,
      };

      saveSearchedData(geolocationData);
    }
  }, [
    userIPData?.ip,
    searchedIP,
    form,
    searchedIPData,
    searchedGeoInfoData,
    searchedIPDataIsLoading,
    searchedGeoInfoDataIsLoading,
    saveSearchedData,
  ]);

  return (
    <div className="md:w-4xl md:mx-auto mx-4 flex min-h-[85dvh] items-center justify-center">
      <div className="grid gap-4 my-4 w-full">
        <Card>
          <CardContent className="space-y-6">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-end gap-2"
            >
              <FieldGroup className="flex-1">
                <Controller
                  control={form.control}
                  name="ip"
                  disabled={userIPDataIsLoading || geoInfoDataIsLoading}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="ip-input">IP Address</FieldLabel>
                      <Input
                        id="ip-input"
                        required
                        type="text"
                        disabled={field.disabled}
                        placeholder="Enter IP address (e.g., 192.168.1.1)"
                        {...field}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
              <div className="flex gap-2">
                <Button
                  disabled={
                    searchedIPDataIsLoading ||
                    searchedGeoInfoDataIsLoading ||
                    (searchedIP && currentFormIP === searchedIP) ||
                    (!searchedIP && currentFormIP === userIPData?.ip)
                  }
                  type="submit"
                >
                  {searchedIPDataIsLoading || searchedGeoInfoDataIsLoading ? (
                    <Spinner />
                  ) : (
                    "Search"
                  )}
                </Button>
                {searchedIP && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearSearch}
                    disabled={
                      searchedIPDataIsLoading || searchedGeoInfoDataIsLoading
                    }
                  >
                    Clear
                  </Button>
                )}
              </div>
            </form>
            {((searchedIP && (searchedIPData || searchedIPDataIsLoading)) ||
              (!searchedIP && (userIPData || userIPDataIsLoading))) && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Location Minimap</h3>
                {searchedIPDataIsLoading || userIPDataIsLoading ? (
                  <div className="w-full h-[300px] rounded-lg mx-auto border flex items-center justify-center bg-gray-100 animate-pulse"></div>
                ) : (
                  <DynamicMap
                    center={
                      searchedIP && searchedIPData?.loc
                        ? (searchedIPData.loc.split(",").map(Number) as [
                            number,
                            number
                          ])
                        : userIPData?.loc
                        ? (userIPData.loc.split(",").map(Number) as [
                            number,
                            number
                          ])
                        : [51.505, -0.09]
                    }
                    zoom={14}
                  />
                )}
              </div>
            )}
            {searchedIPData && !searchedIPDataIsLoading ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    IP Information - {searchedIP}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <strong>IP:</strong> {searchedIPData.ip}
                    </div>
                    <div>
                      <strong>Hostname:</strong> {searchedIPData.hostname}
                    </div>
                    <div>
                      <strong>City:</strong> {searchedIPData.city}
                    </div>
                    <div>
                      <strong>Region:</strong> {searchedIPData.region}
                    </div>
                    <div>
                      <strong>Country:</strong> {searchedIPData.country}
                    </div>
                    <div>
                      <strong>Location:</strong> {searchedIPData.loc}
                    </div>
                    <div>
                      <strong>Organization:</strong> {searchedIPData.org}
                    </div>
                    <div>
                      <strong>Postal:</strong> {searchedIPData.postal}
                    </div>
                    <div className="md:col-span-2">
                      <strong>Timezone:</strong> {searchedIPData.timezone}
                    </div>
                  </div>
                </div>
                {searchedGeoInfoData && !searchedGeoInfoDataIsLoading && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Geographic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <strong>ASN:</strong> {searchedGeoInfoData.asn}
                      </div>
                      <div>
                        <strong>AS Name:</strong> {searchedGeoInfoData.as_name}
                      </div>
                      <div>
                        <strong>AS Domain:</strong>{" "}
                        {searchedGeoInfoData.as_domain}
                      </div>
                      <div>
                        <strong>Country Code:</strong>{" "}
                        {searchedGeoInfoData.country_code}
                      </div>
                      <div>
                        <strong>Country:</strong> {searchedGeoInfoData.country}
                      </div>
                      <div>
                        <strong>Continent Code:</strong>{" "}
                        {searchedGeoInfoData.continent_code}
                      </div>
                      <div>
                        <strong>Continent:</strong>{" "}
                        {searchedGeoInfoData.continent}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {userIPData && !userIPDataIsLoading && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Your IP Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <strong>IP:</strong> {userIPData.ip}
                      </div>
                      <div>
                        <strong>Hostname:</strong> {userIPData.hostname}
                      </div>
                      <div>
                        <strong>City:</strong> {userIPData.city}
                      </div>
                      <div>
                        <strong>Region:</strong> {userIPData.region}
                      </div>
                      <div>
                        <strong>Country:</strong> {userIPData.country}
                      </div>
                      <div>
                        <strong>Location:</strong> {userIPData.loc}
                      </div>
                      <div>
                        <strong>Organization:</strong> {userIPData.org}
                      </div>
                      <div>
                        <strong>Postal:</strong> {userIPData.postal}
                      </div>
                      <div className="md:col-span-2">
                        <strong>Timezone:</strong> {userIPData.timezone}
                      </div>
                    </div>
                  </div>
                )}
                {geoInfoData && !geoInfoDataIsLoading && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Geographic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <strong>ASN:</strong> {geoInfoData.asn}
                      </div>
                      <div>
                        <strong>AS Name:</strong> {geoInfoData.as_name}
                      </div>
                      <div>
                        <strong>AS Domain:</strong> {geoInfoData.as_domain}
                      </div>
                      <div>
                        <strong>Country Code:</strong>{" "}
                        {geoInfoData.country_code}
                      </div>
                      <div>
                        <strong>Country:</strong> {geoInfoData.country}
                      </div>
                      <div>
                        <strong>Continent Code:</strong>{" "}
                        {geoInfoData.continent_code}
                      </div>
                      <div>
                        <strong>Continent:</strong> {geoInfoData.continent}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {searchedIPDataIsLoading || searchedGeoInfoDataIsLoading ? (
              <>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-64" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full md:col-span-2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-56" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </>
            ) : (
              <>
                {userIPDataIsLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full md:col-span-2" />
                    </div>
                  </div>
                )}
                {geoInfoDataIsLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-56" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
