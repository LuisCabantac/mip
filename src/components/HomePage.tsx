"use client";

import z from "zod";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { GeolocationData, searchIPSchema } from "@/lib/schema";
import {
  getGeoInfoByIP,
  getUserIPInfo,
  getUserIPInfoByIP,
} from "@/lib/services/ip";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-lg mx-auto border flex items-center justify-center bg-gray-100 animate-pulse"></div>
  ),
});

export default function HomePage({
  userData,
  isAuthenticated,
  onGetAllHistory,
  onCreateHistory,
  onDeleteHistory,
}: {
  userData: {
    id: string;
    email: string;
  } | null;
  isAuthenticated: boolean;
  onGetAllHistory: () => Promise<{
    data: { id: string; geolocationData: GeolocationData[] }[];
  } | null>;
  onCreateHistory: (geolocationData: GeolocationData) => Promise<void>;
  onDeleteHistory: (ids: string[]) => Promise<void>;
}) {
  const [searchedIP, setSearchedIP] = useState("");
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [isFromHistory, setIsFromHistory] = useState(false);
  const queryClient = useQueryClient();

  const { data: userIPData, isLoading: userIPDataIsLoading } = useQuery({
    queryKey: [""],
    queryFn: getUserIPInfo,
  });

  const { data: searchedIPData, isLoading: searchedIPDataIsLoading } = useQuery(
    {
      queryKey: [`searched-ip-${searchedIP}`],
      queryFn: () => getUserIPInfoByIP(searchedIP),
      enabled: !!searchedIP && isAuthenticated,
    }
  );

  const { data: geoInfoData, isLoading: geoInfoDataIsLoading } = useQuery({
    queryKey: [`ip-${userIPData?.ip}`],
    queryFn: () => getGeoInfoByIP(userIPData?.ip ?? ""),
    enabled: !!userIPData?.ip && isAuthenticated,
  });

  const { data: searchedGeoInfoData, isLoading: searchedGeoInfoDataIsLoading } =
    useQuery({
      queryKey: [`searched-ip-${searchedIP}-geo`],
      queryFn: () => getGeoInfoByIP(searchedIP),
      enabled: !!searchedIP && isAuthenticated,
    });

  const { mutate: saveSearchedData } = useMutation({
    mutationFn: onCreateHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`${userData?.id}-history`],
      });
    },
  });

  const {
    mutate: deleteSelectedHistory,
    isPending: deleteSelectedHistoryIsPending,
  } = useMutation({
    mutationFn: onDeleteHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`${userData?.id}-history`],
      });
      setSelectedHistory([]);
    },
  });

  const { data: savedSearchedData, isLoading: savedSearchedDataIsLoading } =
    useQuery({
      queryKey: [`${userData?.id}-history`],
      queryFn: onGetAllHistory,
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
    setIsFromHistory(false);
  }

  function handleClearSearch() {
    setSearchedIP("");
    setIsFromHistory(false);
    form.reset({
      ip: userIPData?.ip ?? "",
    });
  }

  function handleSetHistory(id: string, checked: boolean) {
    setSelectedHistory((prev) =>
      checked ? [...prev, id] : prev.filter((historyId) => historyId !== id)
    );
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
      !searchedGeoInfoDataIsLoading &&
      !isFromHistory
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
      queryClient.invalidateQueries({
        queryKey: [`${userData?.id}-history`],
      });
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
    isFromHistory,
    queryClient,
    userData?.id,
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
                {userIPData &&
                  !userIPDataIsLoading &&
                  !searchedIPDataIsLoading && (
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
                {geoInfoData &&
                  !geoInfoDataIsLoading &&
                  !searchedGeoInfoDataIsLoading && (
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
        <Card>
          <CardContent>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="item-1"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger
                  className="text-lg font-semibold"
                  disabled={savedSearchedDataIsLoading}
                >
                  History
                </AccordionTrigger>
                <AccordionContent className="flex flex-col w-full gap-4">
                  {savedSearchedData?.data.length ? (
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 items-center">
                        <Label>
                          <Checkbox
                            disabled={
                              !savedSearchedData?.data ||
                              deleteSelectedHistoryIsPending
                            }
                            checked={
                              selectedHistory.length ===
                                savedSearchedData?.data?.length &&
                              selectedHistory.length > 0
                            }
                            onCheckedChange={(checked) => {
                              if (checked as boolean) {
                                setSelectedHistory(
                                  savedSearchedData?.data?.map(
                                    (data) => data.id
                                  ) || []
                                );
                              } else {
                                setSelectedHistory([]);
                              }
                            }}
                          />
                          {savedSearchedData?.data.length ===
                          selectedHistory.length
                            ? "Unselect All"
                            : "Select All"}
                        </Label>
                      </div>
                      <Button
                        variant="destructive"
                        disabled={
                          !selectedHistory.length ||
                          deleteSelectedHistoryIsPending
                        }
                        className="cursor-pointer"
                        onClick={() => deleteSelectedHistory(selectedHistory)}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
                  {savedSearchedData?.data?.length ? (
                    <ul className="flex flex-col w-full gap-2 text-balance">
                      {savedSearchedData.data.map((item) => (
                        <li key={item.id} className="space-y-2">
                          {Array.isArray(item.geolocationData) ? (
                            item.geolocationData.map((geoData, index) => (
                              <div
                                key={index}
                                className="text-sm border-b pb-2 last:border-b-0"
                              >
                                <div className="flex items-start gap-4">
                                  <Checkbox
                                    checked={selectedHistory.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      handleSetHistory(
                                        item.id,
                                        checked as boolean
                                      );
                                    }}
                                    disabled={deleteSelectedHistoryIsPending}
                                  />
                                  <button
                                    onClick={() => {
                                      setSearchedIP(geoData.ip);
                                      setIsFromHistory(true);
                                      form.setValue("ip", geoData.ip);
                                    }}
                                    className="text-start group cursor-pointer w-full"
                                  >
                                    <div className="group-hover:underline">
                                      <strong>IP:</strong> {geoData.ip}
                                    </div>
                                    <div className="group-hover:underline">
                                      <strong>City:</strong> {geoData.city}
                                    </div>
                                    <div className="group-hover:underline">
                                      <strong>Country:</strong>{" "}
                                      {geoData.country}
                                    </div>
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : item.geolocationData &&
                            !Array.isArray(item.geolocationData) ? (
                            <div className="text-sm flex items-start gap-2">
                              <Checkbox
                                checked={selectedHistory.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  handleSetHistory(item.id, checked as boolean);
                                }}
                                disabled={deleteSelectedHistoryIsPending}
                              />
                              <button
                                onClick={() => {
                                  const geoData =
                                    item.geolocationData as unknown as GeolocationData;
                                  setSearchedIP(geoData.ip);
                                  setIsFromHistory(true);
                                  form.setValue("ip", geoData.ip);
                                }}
                                className="text-start group w-full cursor-pointer"
                              >
                                <div className="group-hover:underline">
                                  <strong>IP:</strong>{" "}
                                  {
                                    (
                                      item.geolocationData as unknown as GeolocationData
                                    ).ip
                                  }
                                </div>
                                <div className="group-hover:underline">
                                  <strong>City:</strong>{" "}
                                  {
                                    (
                                      item.geolocationData as unknown as GeolocationData
                                    ).city
                                  }
                                </div>
                                <div className="group-hover:underline">
                                  <strong>Country:</strong>{" "}
                                  {
                                    (
                                      item.geolocationData as unknown as GeolocationData
                                    ).country
                                  }
                                </div>
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              No geolocation data available
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No search history available</p>
                      <p className="text-sm mt-1">
                        Search for IP addresses to build your history
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
