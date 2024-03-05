import { Flex, Select } from "antd"
import AddAuthorForm from "./AddAuthorForm"
import { useSettings } from "../context/SettingsContext"
import { useEffect, useState } from "react"
import { Author } from "../Models"
import { useLookups } from "../context/LookupDataContext"
import { useData } from "../context/UploadDataContext"

const AuthorSelectForm: React.FC = () => {
    // load the backendUrl from the Settings
    const { backendUrl } = useSettings()

    // use the Lookup Context to grab the authors and invalidate function
    const { authors, invalidate } = useLookups()

    // get the context to update the metadata
    const { metadata, updateMetadata } = useData()

    // create a state to set the current first author and list of coauthors
    const [firstAuthor, setFirstAuthor] = useState<Author | null>(metadata.firstAuthor || null)
    const [coAuthors, setCoAuthors] = useState<Author[]>(metadata.coAuthors || [])

    // use Effect to update the Metadata whenever the firstAuthor or coAuthors change
    useEffect(() => {
        updateMetadata('firstAuthor', firstAuthor)
        updateMetadata('coAuthors', coAuthors)
    }, [firstAuthor, coAuthors]) 

    // some helper functions to format some stuff
    const authorLabel = (author: Author): string => {
        if (author.is_organisation) {
            return `${author.organisation_name} (${author.organisation_abbrev})`
        } else {
            return `${author.first_name} ${author.last_name}`
        }
    }

    return (<>
        <Flex style={{width: '100%', alignItems: 'center'}}>
            <div style={{marginRight: '1rem'}}>First Author</div>
            <Select
                style={{flexGrow: 1}}
                //value={firstAuthor?.uuid}
                value={metadata.firstAuthor?.uuid}
                placeholder="Select the first author"
                options={authors.map(author => ({label: authorLabel(author), value: author.uuid}))}
                onChange={value => setFirstAuthor(authors.find(author => author.uuid === value) || null)}
            />
            <AddAuthorForm backendUrl={backendUrl} onSuccess={() =>  invalidate()} />
        </Flex>
        <Flex style={{width: '100%', alignItems: 'center'}}>
            <div style={{marginRight: '1rem'}}>Co-Authors</div>
            <Select
                mode="multiple"
                style={{flexGrow: 1}}
                value={coAuthors.map(a => a.uuid)}
                placeholder="Add all co-authors in order if any"
                options={authors.filter(a => !firstAuthor || (firstAuthor && firstAuthor.id !== a.id)).map(a => ({label: authorLabel(a), value: a.uuid}))}
                onChange={(values) => setCoAuthors(authors.filter(a => values.includes(a.uuid)))}
            />
        </Flex>
    </>)
}

export default AuthorSelectForm

