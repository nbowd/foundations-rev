const {validateUser, validateManager} = require("../utils/middleware");
const { validateChangeRole } = require("../controller/usersController");
const {validateReceipt, validateStatusChange, validateTicketPost} = require("../controller/ticketsController");
const {validatePhoto} = require("../controller/profileController");

const user = {
    user_id: "1l123kl1j",
    username: "nick@rev.com",
    password: "rev",
    role: "manager"
}

const ticket = {
    ticket_id: "e80d06f6-237d-4507-bbd8-62c1ae451e3f",
    description: "Donor dinner at McDonalds",
    amount: 350,
    type: "food",
    author: "a1be6ac8-e028-4f33-9755-490959fdbbe7",
    resolver: "",
    status: "pending",
    receipt: ""
}

const image = Buffer.from('dummy data');

const profile = {
    user_id: "a1be6ac8-e028-4f33-9755-490959fdbbe7",
    office_location: "Seattle",
    profile_picture: "profile/323532b0-39c4-41cb-a686-64587a74f434.jpg",
    last_name: "Bowden",
    first_name: "Nick",
    title: "Associate SWE"
}
describe("validateUser", () => {
    test("Correct Values", () => {
        let result = validateUser(user);
        expect(result).toEqual(true);
    })
    test("Incorrect Values", () => {
        let result = validateUser({...user, password: ""});
        expect(result).toEqual(false);
    })
})
describe('validateManager', () => { 
    test("Correct Values", () => {
        let result = validateManager(user);
        expect(result).toEqual(true);
    })
    test("Incorrect Values", () => {
        let result = validateManager({...user, role: "employee"});
        expect(result).toEqual(false);
    })
 })
describe('validateChangeRole', () => { 
    test("Correct Values", () => {
        let result = validateChangeRole(user.user_id, 'employee', user);
        expect(result).toEqual(true);
    })
    test("Incorrect Value", () => {
        let result = validateChangeRole("", 'cat', {});
        expect(result).toEqual(false);
    })
 })
describe('validateStatusChange', () => { 
    test('Correct Values', () => { 
        let result = validateStatusChange(ticket.ticket_id, 'approved');
        expect(result).toEqual(true);
     })
    test('Incorrect Values', () => { 
        let result = validateStatusChange('', 'cat');
        expect(result).toEqual(false);
     })
 })
 describe('validTicketPost', () => { 
    test('Correct', () => { 
        let result = validateTicketPost(ticket);
        expect(result).toEqual(true);
     })
    test('Incorrect', () => { 
        let result = validateTicketPost({});
        expect(result).toEqual(false);
     })
  })
describe('validateReceipt', () => { 
    test('Correct', () => { 
        let result = validateReceipt(ticket.ticket_id, image);
        expect(result).toEqual(true);
     })
    test('Incorrect', () => { 
        let result = validateReceipt("", Buffer.from(""));
        expect(result).toEqual(false);
     })
 })
describe('validatePhoto', () => { 
    test('Correct', () => { 
        let result = validatePhoto(user.user_id, image);
        expect(result).toEqual(true);
     })
    test('Incorrect', () => { 
        let result = validatePhoto("", Buffer.from(""));
        expect(result).toEqual(false);
     })
 })