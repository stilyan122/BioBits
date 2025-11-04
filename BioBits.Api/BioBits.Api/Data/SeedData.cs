using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BioBits.Api.Data
{
    public static class SeedData
    {
        public static async Task EnsureSeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var provider = scope.ServiceProvider;

            var db = provider.GetRequiredService<AppDbContext>();
            await db.Database.MigrateAsync();

            var roleManager = provider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = provider.GetRequiredService<UserManager<IdentityUser>>();

            var allowed = new[] { "Admin", "Student" };

            foreach (var r in allowed)
            {
                if (!await roleManager.RoleExistsAsync(r))
                    await roleManager.CreateAsync(new IdentityRole(r));
            }

            var allRoles = roleManager.Roles.ToList();
            var toDelete = allRoles.Where(r => !allowed.Contains(r.Name!)).Select(r => r.Name!).ToList();

            foreach (var roleName in toDelete)
            {
                var usersInRole = await userManager.GetUsersInRoleAsync(roleName);
                foreach (var u in usersInRole)
                    await userManager.RemoveFromRoleAsync(u, roleName);

                var role = await roleManager.FindByNameAsync(roleName);
                if (role != null)
                    await roleManager.DeleteAsync(role);
            }

            const string adminEmail = "admin@biobits.local";
            const string adminPass = "Admin123!";

            var admin = await userManager.FindByEmailAsync(adminEmail);
            if (admin == null)
            {
                admin = new IdentityUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true
                };
                var createResult = await userManager.CreateAsync(admin, adminPass);
                if (createResult.Succeeded)
                    await userManager.AddToRoleAsync(admin, "Admin");
            }
            else
            {
                if (!await userManager.IsInRoleAsync(admin, "Admin"))
                    await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
    }
}
