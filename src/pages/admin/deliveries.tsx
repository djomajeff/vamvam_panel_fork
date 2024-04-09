import {
    Avatar,
    Badge,
    Box,
    Button,
    Heading,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Thead,
    Th,
    Tr,
    useDisclosure
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { OverviewTable, Sprite } from "../../components/UI";
import { AppDispatch, RootState } from "../../store";
import { fetchDeliveries } from "../../store/deliveries/listing.ts";
import { RequestResult, DELIVERY_STATUS, DELIVERY_SCHEME } from "../../helper/enums.ts";
import { useEffect, useState } from "react";
import { DeliveryData } from "../../models/delivery.ts";
import { getFormatter } from "../../helper/utils.ts";

const formatter = getFormatter();
const fullName = (first?: string, last?: string) => ((first ?? "") + " " + (last ?? "")).trim();
const statusMap = Object.assign({}, DELIVERY_STATUS);
const schemeMap = Object.assign({}, DELIVERY_SCHEME);
function UserAvatar(props: any) {
    const name = fullName(props.firstName, props.lastName);
    return (
        <HStack spacing="3">
            <Avatar name={props.name ?? name} src={props.avatar} boxSize="10" />
            <Box>
                <Text fontWeight="medium" casing={"capitalize"}>{props.name ?? name}</Text>
                <Text fontSize={"sm"} color={"fg.muted"}>{props.phone}</Text>
            </Box>
        </HStack>
    );
}
function Ratings(props: any) {
    return (
        <div className="row ratings">
            {
                Array(5).fill("").map(function(val, index) {
                    return (
                        <Sprite key={index} name="star" options={{ "data-theme": index < props.note ? "rating-bg" : "rating-fg" }} title={val + "star number " + (index + 1) + " " + (index < props.note ? "filled" : "empty")} />
                    );
                })
            }
        </div>
    );
}

function Location(props: any) {
    return (
        props.address
            ? <Text>{props.address}</Text>
            : <Box>
                <Text fontSize={"sm"}>longitude: {props.longitude}</Text>
                <Text fontSize={"sm"}>latitude: {props.latitude}</Text>
            </Box>
    );
}

function DeliveryDetails(props: any) {
    return (
        <Modal isOpen={props.opened} onClose={props.onClose} size={"xl"}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader><Heading as={"h2"} size={"lg"}>Delivery Summary</Heading></ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <div className="stack box">
                        <div className="segragator">
                            <Heading as={"h3"} size={"md"}>
                                Status  <Badge p={1.5} borderRadius={".25rem"} colorScheme={schemeMap[props.data.status]}>
                                    {statusMap[props.data.status]}
                                </Badge>
                            </Heading>
                            <Badge colorScheme="whatsapp" p={1.5} borderRadius={".25rem"} >{formatter.formatCurrency(props.data.price ?? "")}</Badge>
                        </div>
                        <Heading as={"h3"} size={"md"}>Client Informations</Heading>
                        <div className="row wrap fill-evenly">
                            <div className="stack">
                                <Heading as={"h4"} size={"sm"} colorScheme={"facebook"}>SENDER</Heading>
                                <UserAvatar {...props.data.client} />
                            </div>
                            <div className="stack">
                                <Heading as={"h4"} size={"sm"} colorScheme="teal">RECIPIENT</Heading>
                                <UserAvatar {...(props.data.recipientInfos?.main ?? props.data?.recipientInfos ?? {})} />
                            </div>
                        </div>
                        <Heading as={"h3"} size={"md"}>Route Informations</Heading>
                        <div className="row wrap fill-evenly">
                            <div className="stack">
                                <Heading as={"h4"} size={"sm"} colorScheme={"facebook"}>DEPARTURE</Heading>
                                <Location {...props.data.departure} />
                            </div>
                            <div className="stack">
                                <Heading as={"h4"} size={"sm"} colorScheme="teal">DESTINATION</Heading>
                                <Location {...props.data.destination} />
                            </div>
                        </div>
                        <div className="row wrap fill-evenly capitalize">
                            <div className="stack">
                                <Heading as={"h3"} size={"md"}>package type</Heading>
                                <Text>{props.data.packageType}</Text>
                            </div>
                            {
                                (props.data.note ?? 3)
                                    ?
                                    <div className="stack">
                                        <Heading as={"h3"} size={"md"} >note</Heading>
                                        <Ratings note={props.data.note ?? 3} />
                                    </div>
                                    : ""
                            }
                        </div>

                    </div>

                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

function MemberTable(props: any) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [details, setDetails] = useState({});

    function preview(data: DeliveryData) {
        onOpen();
        setDetails(data);
    }
    return (
        <>
            <DeliveryDetails data={details} opened={isOpen} onClose={onClose} />
            <Table >
                <Thead>
                    <Tr>
                        {(props.colNames ?? []).map((colName: any, index: number) => (
                            <Th key={index}>{colName}</Th>
                        ))
                        }
                    </Tr>
                </Thead>
                <Tbody>
                    {(props.dataSource ?? []).map((data: DeliveryData) => (
                        <Tr key={data.id}>
                            <Td>
                                <UserAvatar {...data.client} />
                            </Td>
                            <Td>
                                <Badge size="sm" p={1.5} borderRadius={".5rem"} colorScheme={schemeMap[data.status]}>
                                    {statusMap[data.status]}
                                </Badge>
                            </Td>
                            <Td>
                                <Location {...data.departure} />
                            </Td>
                            <Td>
                                <Location {...data.destination} />
                            </Td>
                            <Td><Button onClick={() => preview(data)} variant={"ghost"} colorScheme="teal"><Text casing={"capitalize"}>view details</Text></Button></Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </>
    );
}

function Deliveries() {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((rootState: RootState) => rootState.deliveries);
    const headers = ["client", "status", "departure", "destination", ""];

    useEffect(() => requestDeliveries(), []);

    function requestDeliveries() {
        dispatch(fetchDeliveries());
    }

    return (
        <Stack>
            {
                state.result === RequestResult.resolved
                    ? (
                        <OverviewTable title="delivery list">
                            <MemberTable colNames={headers} dataSource={state.data?.results ?? []} />
                        </OverviewTable>
                    )
                    : (
                        <p>loading...</p>
                    )
            }
        </Stack>
    );
}

export default Deliveries;
