using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;
using ZacharyHeng_Project.Models;

namespace ZacharyHeng_Project.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly ApplicationDBContext _context;

        public BookingController(ApplicationDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll(
            [FromQuery] string search = null,
            [FromQuery] string sortBy = null,
            [FromQuery] bool descending = false)
        {
            var username = User.Identity.Name;
            IQueryable<Booking> bookings;

            if (User.IsInRole(UserRoles.Admin))
            {
                bookings = _context.Bookings.AsQueryable();
            }
            else
            {
                bookings = _context.Bookings.Where(b => b.BookedBy == username);
            }

            if (!string.IsNullOrEmpty(search))
            {
                bookings = bookings.Where(b =>
                    b.FacilityDescription.Contains(search) ||
                    b.BookingStatus.Contains(search) ||
                    b.BookedBy.Contains(search)
                );
            }

            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "bookingid":
                        bookings = descending ? bookings.OrderByDescending(b => b.BookingID)
                                              : bookings.OrderBy(b => b.BookingID);
                        break;
                    case "facilitydescription":
                        bookings = descending ? bookings.OrderByDescending(b => b.FacilityDescription)
                                              : bookings.OrderBy(b => b.FacilityDescription);
                        break;
                    case "bookingdatefrom":
                        bookings = descending ? bookings.OrderByDescending(b => b.BookingDateFrom)
                                              : bookings.OrderBy(b => b.BookingDateFrom);
                        break;
                    case "bookingdateto":
                        bookings = descending ? bookings.OrderByDescending(b => b.BookingDateTo)
                                              : bookings.OrderBy(b => b.BookingDateTo);
                        break;
                    case "bookingstatus":
                        bookings = descending ? bookings.OrderByDescending(b => b.BookingStatus)
                                              : bookings.OrderBy(b => b.BookingStatus);
                        break;
                    default:
                        bookings = bookings.OrderBy(b => b.BookingID);
                        break;
                }
            }

            return Ok(bookings.ToList());
        }

        [Authorize(Roles = UserRoles.Admin)]
        [HttpGet("{id}")]
        public IActionResult GetById(int? id)
        {
            var bookings = _context.Bookings.FirstOrDefault(e => e.BookingID == id);
            if (bookings == null)
                return Problem(detail: "Booking with id" + id + "is not found.", statusCode: 404);

            return Ok(bookings);
        }

        [HttpPost]
        public IActionResult CreateBooking([FromBody] Booking booking)
        {
            if (booking == null)
            {
                return BadRequest("Booking cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(booking.FacilityDescription) ||
                string.IsNullOrWhiteSpace(booking.BookingDateFrom) ||
                string.IsNullOrWhiteSpace(booking.BookingDateTo) ||
                string.IsNullOrWhiteSpace(booking.BookingStatus))
            {
                return BadRequest("All fields are required.");
            }

            // Additional validation logic if needed

            var username = User.Identity.Name;
            booking.BookedBy = username;

            _context.Bookings.Add(booking);
            _context.SaveChanges();
            return Ok(booking);
        }


        [HttpPut("{id}")]
        public IActionResult UpdateBooking(int id, [FromBody] Booking booking)
        {
            if (booking == null)
                return BadRequest("Booking cannot be null.");

            var entity = _context.Bookings.FirstOrDefault(e => e.BookingID == id);
            if (entity == null)
                return NotFound($"Booking with ID {id} not found.");

            var currentUserId = User.Identity.Name;

            var isAdmin = User.IsInRole(UserRoles.Admin);
            var isCreator = entity.BookedBy == currentUserId;

            if (!isAdmin && !isCreator)
                return Forbid("You do not have permission to update this booking.");

            // Update the booking details
            entity.FacilityDescription = booking.FacilityDescription;
            entity.BookingDateFrom = booking.BookingDateFrom;
            entity.BookingDateTo = booking.BookingDateTo;
            entity.BookingStatus = booking.BookingStatus;

            _context.SaveChanges();

            return Ok(entity);
        }

        [HttpPatch("Cancel/{id}")]
        public IActionResult CancelBooking(int id)
        {
            var booking = _context.Bookings.FirstOrDefault(b => b.BookingID == id);
            if (booking == null)
                return NotFound($"Booking with ID {id} not found.");

            var currentUserId = User.Identity.Name;
            var isAdmin = User.IsInRole(UserRoles.Admin);
            var isCreator = booking.BookedBy == currentUserId;

            if (!isAdmin && !isCreator)
                return Forbid("You do not have permission to cancel this booking.");

            booking.BookingStatus = "Cancelled"; // Or whatever status represents a canceled booking
            _context.SaveChanges();

            return Ok(booking);
        }

        [HttpPatch("Bringback/{id}")]
        public IActionResult BringbackBooking(int id)
        {
            var booking = _context.Bookings.FirstOrDefault(b => b.BookingID == id);
            if (booking == null)
                return NotFound($"Booking with ID {id} not found.");

            var currentUserId = User.Identity.Name;
            var isAdmin = User.IsInRole(UserRoles.Admin);
            var isCreator = booking.BookedBy == currentUserId;

            if (!isAdmin && !isCreator)
                return Forbid("You do not have permission to bring back this booking.");

            booking.BookingStatus = "Pending"; // Or whatever status represents a canceled booking
            _context.SaveChanges();

            return Ok(booking);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteBooking(int id)
        {
            var entity = _context.Bookings.FirstOrDefault(e => e.BookingID == id);
            if (entity == null)
                return NotFound($"Booking with ID {id} not found.");

            var currentUserId = User.Identity.Name;

            var isAdmin = User.IsInRole(UserRoles.Admin);
            var isCreator = entity.BookedBy == currentUserId;

            if (!isAdmin && !isCreator)
                return Forbid("You do not have permission to delete this booking.");

            _context.Bookings.Remove(entity);
            _context.SaveChanges();

            return Ok($"Booking with ID {id} has been deleted.");
        }
    }
}
