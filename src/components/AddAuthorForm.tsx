import { useEffect, useState } from "react"
import { PlusOutlined } from "@ant-design/icons"
import { Button, Input, Modal, Space, Switch } from "antd"
import axios from "axios"

import { Author } from "../Models"

interface AddAuthorFormProps {
    backendUrl: string
    onSuccess: (author: Author) => void
}
const AddAuthorForm: React.FC<AddAuthorFormProps> = ({ backendUrl, onSuccess }) => {
    // add state to show the modal
    const [showModal, setShowModal] = useState<boolean>(false)

    // author organisation switch
    const [isOrganisation, setIsOrganisation] = useState<boolean>(false)
    const [isValid, setIsValid] = useState<boolean>(false)

    // data properties
    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [affiliation, setAffiliation] = useState<string>('')
    const [attribution, setAttribution] = useState<string>('')
    const [organisationName, setOrganisationName] = useState<string>('')
    const [organisationAbbrev, setOrganisationAbbrev] = useState<string>('')
    
    const onOk = () => {
        // generate the correct object
        let author: Partial<Author> = {
            is_organisation: isOrganisation,
            first_name: isOrganisation ? null : firstName,
            last_name: isOrganisation ? null : lastName,
            affiliation: isOrganisation ? null : affiliation,
            organisation_name: isOrganisation ? organisationName : null,
            organisation_abbrev: isOrganisation ? organisationAbbrev : null,
            attribution: attribution,
        }

        // call the backend url with a put request using axios
        axios.put<Author>(`${backendUrl}author`, author).then(response => {                    
            // finally close the model
            setShowModal(false)

            // call the success function
            onSuccess(response.data)
        })
    }

    // use Effect to dynamically update the isValid state
    useEffect(() => {
        if (isOrganisation) {
            setIsValid(organisationName.length > 0 && organisationAbbrev.length > 0)
        } else {
            setIsValid(firstName.length > 0 && lastName.length > 0 && affiliation.length > 0)
        }
    }, [isOrganisation, firstName, lastName, affiliation, organisationName, organisationAbbrev])
    
    return (<>
        <Button style={{marginLeft: '1rem'}} type="dashed" icon={<PlusOutlined />} onClick={() => setShowModal(true) } />
        <Modal
            title="Add new Author"
            open={showModal}
            onCancel={() => setShowModal(false)}
            onOk={onOk}
            okButtonProps={{disabled: !isValid}}
        >   
            
            <Switch checkedChildren="Add Organisation" unCheckedChildren="Add Person" value={isOrganisation} onChange={s => setIsOrganisation(s)} />
            <br />
            <Space direction="vertical" style={{marginTop: '1rem'}}>
            { isOrganisation ? (
                <>
                <Input type="text" placeholder="Organisation Name" addonBefore="Organisation Name" value={organisationName} onChange={e => setOrganisationName(e.target.value)} />
                <Input type="text" placeholder="Organisation Abbreviation" addonBefore="Organisation Abbreviation" value={organisationAbbrev} onChange={e => setOrganisationAbbrev(e.target.value)} />
                </>
            ) : (
                <>
                <Input type="text" placeholder="First Name" addonBefore="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                <Input type="text" placeholder="Last Name" addonBefore="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
                <Input type="text" placeholder="Affiliation" addonBefore="Affiliation" value={affiliation} onChange={e => setAffiliation(e.target.value)} />
                </>
            ) }
            <Input type="text" placeholder="Attribution" addonBefore="Attribution" value={attribution} onChange={e => setAttribution(e.target.value)} />
            </Space>
        </Modal>
    </>)
}

export default AddAuthorForm